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
define(["require", "exports", "vs/base/common/async", "vs/base/common/buffer", "vs/base/common/cancellation", "vs/base/common/errors", "vs/base/common/network", "vs/base/common/resources", "vs/base/common/ternarySearchTree", "vs/base/common/uri", "vs/base/common/uuid", "vs/nls", "vs/platform/configuration/common/configuration", "vs/platform/extensions/common/extensions", "vs/platform/files/common/files", "vs/platform/instantiation/common/instantiation", "vs/platform/log/common/log", "vs/platform/notification/common/notification", "vs/platform/profiling/electron-sandbox/profileAnalysisWorkerService", "vs/platform/telemetry/common/telemetry", "vs/workbench/contrib/extensions/common/runtimeExtensionsInput", "vs/workbench/contrib/extensions/electron-sandbox/extensionsSlowActions", "vs/workbench/contrib/extensions/electron-sandbox/runtimeExtensionsEditor", "vs/workbench/services/editor/common/editorService", "vs/workbench/services/environment/electron-sandbox/environmentService", "vs/workbench/services/extensions/common/extensions", "vs/workbench/services/extensions/electron-sandbox/extensionHostProfiler", "vs/workbench/services/timer/browser/timerService"], function (require, exports, async_1, buffer_1, cancellation_1, errors_1, network_1, resources_1, ternarySearchTree_1, uri_1, uuid_1, nls_1, configuration_1, extensions_1, files_1, instantiation_1, log_1, notification_1, profileAnalysisWorkerService_1, telemetry_1, runtimeExtensionsInput_1, extensionsSlowActions_1, runtimeExtensionsEditor_1, editorService_1, environmentService_1, extensions_2, extensionHostProfiler_1, timerService_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.ExtensionsAutoProfiler = void 0;
    let ExtensionsAutoProfiler = class ExtensionsAutoProfiler {
        constructor(_extensionService, _extensionProfileService, _telemetryService, _logService, _notificationService, _editorService, _instantiationService, _environmentServie, _profileAnalysisService, _configService, _fileService, timerService) {
            this._extensionService = _extensionService;
            this._extensionProfileService = _extensionProfileService;
            this._telemetryService = _telemetryService;
            this._logService = _logService;
            this._notificationService = _notificationService;
            this._editorService = _editorService;
            this._instantiationService = _instantiationService;
            this._environmentServie = _environmentServie;
            this._profileAnalysisService = _profileAnalysisService;
            this._configService = _configService;
            this._fileService = _fileService;
            this._blame = new extensions_1.ExtensionIdentifierSet();
            this._perfBaseline = -1;
            timerService.perfBaseline.then(value => {
                if (value < 0) {
                    return; // too slow for profiling
                }
                this._perfBaseline = value;
                this._unresponsiveListener = _extensionService.onDidChangeResponsiveChange(this._onDidChangeResponsiveChange, this);
            });
        }
        dispose() {
            this._unresponsiveListener?.dispose();
            this._session?.dispose(true);
        }
        async _onDidChangeResponsiveChange(event) {
            if (event.extensionHostKind !== 1 /* ExtensionHostKind.LocalProcess */) {
                return;
            }
            const port = await event.getInspectPort(true);
            if (!port) {
                return;
            }
            if (event.isResponsive && this._session) {
                // stop profiling when responsive again
                this._session.cancel();
                this._logService.info('UNRESPONSIVE extension host: received responsive event and cancelling profiling session');
            }
            else if (!event.isResponsive && !this._session) {
                // start profiling if not yet profiling
                const cts = new cancellation_1.CancellationTokenSource();
                this._session = cts;
                let session;
                try {
                    session = await this._instantiationService.createInstance(extensionHostProfiler_1.ExtensionHostProfiler, port).start();
                }
                catch (err) {
                    this._session = undefined;
                    // fail silent as this is often
                    // caused by another party being
                    // connected already
                    return;
                }
                this._logService.info('UNRESPONSIVE extension host: starting to profile NOW');
                // wait 5 seconds or until responsive again
                try {
                    await (0, async_1.timeout)(5e3, cts.token);
                }
                catch {
                    // can throw cancellation error. that is
                    // OK, we stop profiling and analyse the
                    // profile anyways
                }
                try {
                    // stop profiling and analyse results
                    this._processCpuProfile(await session.stop());
                }
                catch (err) {
                    (0, errors_1.onUnexpectedError)(err);
                }
                finally {
                    this._session = undefined;
                }
            }
        }
        async _processCpuProfile(profile) {
            // get all extensions
            await this._extensionService.whenInstalledExtensionsRegistered();
            // send heavy samples iff enabled
            if (this._configService.getValue('application.experimental.rendererProfiling')) {
                const searchTree = ternarySearchTree_1.TernarySearchTree.forUris();
                searchTree.fill(this._extensionService.extensions.map(e => [e.extensionLocation, e]));
                await this._profileAnalysisService.analyseBottomUp(profile.data, url => searchTree.findSubstr(uri_1.URI.parse(url))?.identifier.value ?? '<<not-found>>', this._perfBaseline, false);
            }
            // analyse profile by extension-category
            const categories = this._extensionService.extensions
                .filter(e => e.extensionLocation.scheme === network_1.Schemas.file)
                .map(e => [e.extensionLocation, extensions_1.ExtensionIdentifier.toKey(e.identifier)]);
            const data = await this._profileAnalysisService.analyseByLocation(profile.data, categories);
            //
            let overall = 0;
            let top = '';
            let topAggregated = -1;
            for (const [category, aggregated] of data) {
                overall += aggregated;
                if (aggregated > topAggregated) {
                    topAggregated = aggregated;
                    top = category;
                }
            }
            const topPercentage = topAggregated / (overall / 100);
            // associate extensions to profile node
            const extension = await this._extensionService.getExtension(top);
            if (!extension) {
                // not an extension => idle, gc, self?
                return;
            }
            const sessionId = (0, uuid_1.generateUuid)();
            // print message to log
            const path = (0, resources_1.joinPath)(this._environmentServie.tmpDir, `exthost-${Math.random().toString(16).slice(2, 8)}.cpuprofile`);
            await this._fileService.writeFile(path, buffer_1.VSBuffer.fromString(JSON.stringify(profile.data)));
            this._logService.warn(`UNRESPONSIVE extension host: '${top}' took ${topPercentage}% of ${topAggregated / 1e3}ms, saved PROFILE here: '${path}'`);
            this._telemetryService.publicLog2('exthostunresponsive', {
                sessionId,
                duration: overall,
                data: data.map(tuple => tuple[0]).flat(),
                id: extensions_1.ExtensionIdentifier.toKey(extension.identifier),
            });
            // add to running extensions view
            this._extensionProfileService.setUnresponsiveProfile(extension.identifier, profile);
            // prompt: when really slow/greedy
            if (!(topPercentage >= 95 && topAggregated >= 5e6)) {
                return;
            }
            const action = await this._instantiationService.invokeFunction(extensionsSlowActions_1.createSlowExtensionAction, extension, profile);
            if (!action) {
                // cannot report issues against this extension...
                return;
            }
            // only blame once per extension, don't blame too often
            if (this._blame.has(extension.identifier) || this._blame.size >= 3) {
                return;
            }
            this._blame.add(extension.identifier);
            // user-facing message when very bad...
            this._notificationService.prompt(notification_1.Severity.Warning, (0, nls_1.localize)('unresponsive-exthost', "The extension '{0}' took a very long time to complete its last operation and it has prevented other extensions from running.", extension.displayName || extension.name), [{
                    label: (0, nls_1.localize)('show', 'Show Extensions'),
                    run: () => this._editorService.openEditor(runtimeExtensionsInput_1.RuntimeExtensionsInput.instance, { pinned: true })
                },
                action
            ], { priority: notification_1.NotificationPriority.SILENT });
        }
    };
    exports.ExtensionsAutoProfiler = ExtensionsAutoProfiler;
    exports.ExtensionsAutoProfiler = ExtensionsAutoProfiler = __decorate([
        __param(0, extensions_2.IExtensionService),
        __param(1, runtimeExtensionsEditor_1.IExtensionHostProfileService),
        __param(2, telemetry_1.ITelemetryService),
        __param(3, log_1.ILogService),
        __param(4, notification_1.INotificationService),
        __param(5, editorService_1.IEditorService),
        __param(6, instantiation_1.IInstantiationService),
        __param(7, environmentService_1.INativeWorkbenchEnvironmentService),
        __param(8, profileAnalysisWorkerService_1.IProfileAnalysisWorkerService),
        __param(9, configuration_1.IConfigurationService),
        __param(10, files_1.IFileService),
        __param(11, timerService_1.ITimerService)
    ], ExtensionsAutoProfiler);
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZXh0ZW5zaW9uc0F1dG9Qcm9maWxlci5qcyIsInNvdXJjZVJvb3QiOiJmaWxlOi8vL3dvcmtzcGFjZS9hcHBmbG93L3NyYy8iLCJzb3VyY2VzIjpbInZzL3dvcmtiZW5jaC9jb250cmliL2V4dGVuc2lvbnMvZWxlY3Ryb24tc2FuZGJveC9leHRlbnNpb25zQXV0b1Byb2ZpbGVyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Z0dBR2dHOzs7Ozs7Ozs7Ozs7OztJQWdDekYsSUFBTSxzQkFBc0IsR0FBNUIsTUFBTSxzQkFBc0I7UUFRbEMsWUFDb0IsaUJBQXFELEVBQzFDLHdCQUF1RSxFQUNsRixpQkFBcUQsRUFDM0QsV0FBeUMsRUFDaEMsb0JBQTJELEVBQ2pFLGNBQStDLEVBQ3hDLHFCQUE2RCxFQUNoRCxrQkFBdUUsRUFDNUUsdUJBQXVFLEVBQy9FLGNBQXNELEVBQy9ELFlBQTJDLEVBQzFDLFlBQTJCO1lBWE4sc0JBQWlCLEdBQWpCLGlCQUFpQixDQUFtQjtZQUN6Qiw2QkFBd0IsR0FBeEIsd0JBQXdCLENBQThCO1lBQ2pFLHNCQUFpQixHQUFqQixpQkFBaUIsQ0FBbUI7WUFDMUMsZ0JBQVcsR0FBWCxXQUFXLENBQWE7WUFDZix5QkFBb0IsR0FBcEIsb0JBQW9CLENBQXNCO1lBQ2hELG1CQUFjLEdBQWQsY0FBYyxDQUFnQjtZQUN2QiwwQkFBcUIsR0FBckIscUJBQXFCLENBQXVCO1lBQy9CLHVCQUFrQixHQUFsQixrQkFBa0IsQ0FBb0M7WUFDM0QsNEJBQXVCLEdBQXZCLHVCQUF1QixDQUErQjtZQUM5RCxtQkFBYyxHQUFkLGNBQWMsQ0FBdUI7WUFDOUMsaUJBQVksR0FBWixZQUFZLENBQWM7WUFqQnpDLFdBQU0sR0FBRyxJQUFJLG1DQUFzQixFQUFFLENBQUM7WUFJL0Msa0JBQWEsR0FBVyxDQUFDLENBQUMsQ0FBQztZQWlCbEMsWUFBWSxDQUFDLFlBQVksQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLEVBQUU7Z0JBQ3RDLElBQUksS0FBSyxH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