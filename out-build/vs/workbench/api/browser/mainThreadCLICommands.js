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
define(["require", "exports", "vs/base/common/network", "vs/base/common/platform", "vs/base/common/types", "vs/base/common/uri", "vs/nls!vs/workbench/api/browser/mainThreadCLICommands", "vs/platform/commands/common/commands", "vs/platform/extensionManagement/common/extensionManagement", "vs/platform/extensionManagement/common/extensionManagementCLI", "vs/platform/extensionManagement/common/extensionManagementUtil", "vs/platform/instantiation/common/instantiation", "vs/platform/instantiation/common/serviceCollection", "vs/platform/label/common/label", "vs/platform/log/common/log", "vs/platform/opener/common/opener", "vs/workbench/services/environment/common/environmentService", "vs/workbench/services/extensionManagement/common/extensionManagement", "vs/workbench/services/extensions/common/extensionManifestPropertiesService"], function (require, exports, network_1, platform_1, types_1, uri_1, nls_1, commands_1, extensionManagement_1, extensionManagementCLI_1, extensionManagementUtil_1, instantiation_1, serviceCollection_1, label_1, log_1, opener_1, environmentService_1, extensionManagement_2, extensionManifestPropertiesService_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    // this class contains the commands that the CLI server is reying on
    commands_1.$Gr.registerCommand('_remoteCLI.openExternal', function (accessor, uri) {
        const openerService = accessor.get(opener_1.$NT);
        return openerService.open((0, types_1.$jf)(uri) ? uri : uri_1.URI.revive(uri), { openExternal: true, allowTunneling: true });
    });
    commands_1.$Gr.registerCommand('_remoteCLI.windowOpen', function (accessor, toOpen, options) {
        const commandService = accessor.get(commands_1.$Fr);
        if (!toOpen.length) {
            return commandService.executeCommand('_files.newWindow', options);
        }
        return commandService.executeCommand('_files.windowOpen', toOpen, options);
    });
    commands_1.$Gr.registerCommand('_remoteCLI.getSystemStatus', function (accessor) {
        const commandService = accessor.get(commands_1.$Fr);
        return commandService.executeCommand('_issues.getSystemStatus');
    });
    commands_1.$Gr.registerCommand('_remoteCLI.manageExtensions', async function (accessor, args) {
        const instantiationService = accessor.get(instantiation_1.$Ah);
        const extensionManagementServerService = accessor.get(extensionManagement_2.$fcb);
        const remoteExtensionManagementService = extensionManagementServerService.remoteExtensionManagementServer?.extensionManagementService;
        if (!remoteExtensionManagementService) {
            return;
        }
        const lines = [];
        const logger = new class extends log_1.$$i {
            g(level, message) {
                lines.push(message);
            }
        }();
        const cliService = instantiationService.createChild(new serviceCollection_1.$zh([extensionManagement_1.$2n, remoteExtensionManagementService])).createInstance(RemoteExtensionManagementCLI, logger);
        if (args.list) {
            await cliService.listExtensions(!!args.list.showVersions, args.list.category, undefined);
        }
        else {
            const revive = (inputs) => inputs.map(input => (0, types_1.$jf)(input) ? input : uri_1.URI.revive(input));
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
    let RemoteExtensionManagementCLI = class RemoteExtensionManagementCLI extends extensionManagementCLI_1.$9o {
        constructor(logger, extensionManagementService, extensionGalleryService, labelService, envService, o) {
            super(logger, extensionManagementService, extensionGalleryService);
            this.o = o;
            const remoteAuthority = envService.remoteAuthority;
            this.n = remoteAuthority ? labelService.getHostLabel(network_1.Schemas.vscodeRemote, remoteAuthority) : undefined;
        }
        get f() {
            return this.n;
        }
        k(manifest) {
            if (!this.o.canExecuteOnWorkspace(manifest)
                // Web extensions installed on remote can be run in web worker extension host
                && !(platform_1.$o && this.o.canExecuteOnWeb(manifest))) {
                this.a.info((0, nls_1.localize)(0, null, (0, extensionManagementUtil_1.$so)(manifest.publisher, manifest.name)));
                return false;
            }
            return true;
        }
    };
    RemoteExtensionManagementCLI = __decorate([
        __param(1, extensionManagement_1.$2n),
        __param(2, extensionManagement_1.$Zn),
        __param(3, label_1.$Vz),
        __param(4, environmentService_1.$hJ),
        __param(5, extensionManifestPropertiesService_1.$vcb)
    ], RemoteExtensionManagementCLI);
});
//# sourceMappingURL=mainThreadCLICommands.js.map