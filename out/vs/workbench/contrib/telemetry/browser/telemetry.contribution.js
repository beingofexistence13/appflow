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
define(["require", "exports", "vs/platform/registry/common/platform", "vs/workbench/common/contributions", "vs/workbench/services/lifecycle/common/lifecycle", "vs/platform/telemetry/common/telemetry", "vs/platform/workspace/common/workspace", "vs/workbench/services/editor/common/editorService", "vs/platform/keybinding/common/keybinding", "vs/workbench/services/themes/common/workbenchThemeService", "vs/workbench/services/environment/common/environmentService", "vs/base/common/platform", "vs/base/common/lifecycle", "vs/platform/telemetry/browser/errorTelemetry", "vs/platform/telemetry/common/telemetryUtils", "vs/platform/configuration/common/configuration", "vs/workbench/services/textfile/common/textfiles", "vs/base/common/resources", "vs/base/common/network", "vs/editor/common/services/languagesAssociations", "vs/base/common/hash", "vs/workbench/services/panecomposite/browser/panecomposite", "vs/workbench/services/userDataProfile/common/userDataProfile"], function (require, exports, platform_1, contributions_1, lifecycle_1, telemetry_1, workspace_1, editorService_1, keybinding_1, workbenchThemeService_1, environmentService_1, platform_2, lifecycle_2, errorTelemetry_1, telemetryUtils_1, configuration_1, textfiles_1, resources_1, network_1, languagesAssociations_1, hash_1, panecomposite_1, userDataProfile_1) {
    "use strict";
    var TelemetryContribution_1;
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.TelemetryContribution = void 0;
    let TelemetryContribution = class TelemetryContribution extends lifecycle_2.Disposable {
        static { TelemetryContribution_1 = this; }
        static { this.ALLOWLIST_JSON = ['package.json', 'package-lock.json', 'tsconfig.json', 'jsconfig.json', 'bower.json', '.eslintrc.json', 'tslint.json', 'composer.json']; }
        static { this.ALLOWLIST_WORKSPACE_JSON = ['settings.json', 'extensions.json', 'tasks.json', 'launch.json']; }
        constructor(telemetryService, contextService, lifecycleService, editorService, keybindingsService, themeService, environmentService, userDataProfileService, configurationService, paneCompositeService, textFileService) {
            super();
            this.telemetryService = telemetryService;
            this.contextService = contextService;
            this.userDataProfileService = userDataProfileService;
            const { filesToOpenOrCreate, filesToDiff, filesToMerge } = environmentService;
            const activeViewlet = paneCompositeService.getActivePaneComposite(0 /* ViewContainerLocation.Sidebar */);
            telemetryService.publicLog2('workspaceLoad', {
                windowSize: { innerHeight: window.innerHeight, innerWidth: window.innerWidth, outerHeight: window.outerHeight, outerWidth: window.outerWidth },
                emptyWorkbench: contextService.getWorkbenchState() === 1 /* WorkbenchState.EMPTY */,
                'workbench.filesToOpenOrCreate': filesToOpenOrCreate && filesToOpenOrCreate.length || 0,
                'workbench.filesToDiff': filesToDiff && filesToDiff.length || 0,
                'workbench.filesToMerge': filesToMerge && filesToMerge.length || 0,
                customKeybindingsCount: keybindingsService.customKeybindingsCount(),
                theme: themeService.getColorTheme().id,
                language: platform_2.language,
                pinnedViewlets: paneCompositeService.getPinnedPaneCompositeIds(0 /* ViewContainerLocation.Sidebar */),
                restoredViewlet: activeViewlet ? activeViewlet.getId() : undefined,
                restoredEditors: editorService.visibleEditors.length,
                startupKind: lifecycleService.startupKind
            });
            // Error Telemetry
            this._register(new errorTelemetry_1.default(telemetryService));
            // Configuration Telemetry
            this._register((0, telemetryUtils_1.configurationTelemetry)(telemetryService, configurationService));
            //  Files Telemetry
            this._register(textFileService.files.onDidResolve(e => this.onTextFileModelResolved(e)));
            this._register(textFileService.files.onDidSave(e => this.onTextFileModelSaved(e)));
            // Lifecycle
            this._register(lifecycleService.onDidShutdown(() => this.dispose()));
        }
        onTextFileModelResolved(e) {
            const settingsType = this.getTypeIfSettings(e.model.resource);
            if (settingsType) {
                this.telemetryService.publicLog2('settingsRead', { settingsType }); // Do not log read to user settings.json and .vscode folder as a fileGet event as it ruins our JSON usage data
            }
            else {
                this.telemetryService.publicLog2('fileGet', this.getTelemetryData(e.model.resource, e.reason));
            }
        }
        onTextFileModelSaved(e) {
            const settingsType = this.getTypeIfSettings(e.model.resource);
            if (settingsType) {
                this.telemetryService.publicLog2('settingsWritten', { settingsType }); // Do not log write to user settings.json and .vscode folder as a filePUT event as it ruins our JSON usage data
            }
            else {
                this.telemetryService.publicLog2('filePUT', this.getTelemetryData(e.model.resource, e.reason));
            }
        }
        getTypeIfSettings(resource) {
            if ((0, resources_1.extname)(resource) !== '.json') {
                return '';
            }
            // Check for global settings file
            if ((0, resources_1.isEqual)(resource, this.userDataProfileService.currentProfile.settingsResource)) {
                return 'global-settings';
            }
            // Check for keybindings file
            if ((0, resources_1.isEqual)(resource, this.userDataProfileService.currentProfile.keybindingsResource)) {
                return 'keybindings';
            }
            // Check for snippets
            if ((0, resources_1.isEqualOrParent)(resource, this.userDataProfileService.currentProfile.snippetsHome)) {
                return 'snippets';
            }
            // Check for workspace settings file
            const folders = this.contextService.getWorkspace().folders;
            for (const folder of folders) {
                if ((0, resources_1.isEqualOrParent)(resource, folder.toResource('.vscode'))) {
                    const filename = (0, resources_1.basename)(resource);
                    if (TelemetryContribution_1.ALLOWLIST_WORKSPACE_JSON.indexOf(filename) > -1) {
                        return `.vscode/${filename}`;
                    }
                }
            }
            return '';
        }
        getTelemetryData(resource, reason) {
            let ext = (0, resources_1.extname)(resource);
            // Remove query parameters from the resource extension
            const queryStringLocation = ext.indexOf('?');
            ext = queryStringLocation !== -1 ? ext.substr(0, queryStringLocation) : ext;
            const fileName = (0, resources_1.basename)(resource);
            const path = resource.scheme === network_1.Schemas.file ? resource.fsPath : resource.path;
            const telemetryData = {
                mimeType: new telemetryUtils_1.TelemetryTrustedValue((0, languagesAssociations_1.getMimeTypes)(resource).join(', ')),
                ext,
                path: (0, hash_1.hash)(path),
                reason,
                allowlistedjson: undefined
            };
            if (ext === '.json' && TelemetryContribution_1.ALLOWLIST_JSON.indexOf(fileName) > -1) {
                telemetryData['allowlistedjson'] = fileName;
            }
            return telemetryData;
        }
    };
    exports.TelemetryContribution = TelemetryContribution;
    exports.TelemetryContribution = TelemetryContribution = TelemetryContribution_1 = __decorate([
        __param(0, telemetry_1.ITelemetryService),
        __param(1, workspace_1.IWorkspaceContextService),
        __param(2, lifecycle_1.ILifecycleService),
        __param(3, editorService_1.IEditorService),
        __param(4, keybinding_1.IKeybindingService),
        __param(5, workbenchThemeService_1.IWorkbenchThemeService),
        __param(6, environmentService_1.IWorkbenchEnvironmentService),
        __param(7, userDataProfile_1.IUserDataProfileService),
        __param(8, configuration_1.IConfigurationService),
        __param(9, panecomposite_1.IPaneCompositePartService),
        __param(10, textfiles_1.ITextFileService)
    ], TelemetryContribution);
    platform_1.Registry.as(contributions_1.Extensions.Workbench).registerWorkbenchContribution(TelemetryContribution, 3 /* LifecyclePhase.Restored */);
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidGVsZW1ldHJ5LmNvbnRyaWJ1dGlvbi5qcyIsInNvdXJjZVJvb3QiOiJmaWxlOi8vL3dvcmtzcGFjZS9hcHBmbG93L3NyYy8iLCJzb3VyY2VzIjpbInZzL3dvcmtiZW5jaC9jb250cmliL3RlbGVtZXRyeS9icm93c2VyL3RlbGVtZXRyeS5jb250cmlidXRpb24udHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7Ozs7Ozs7Ozs7OztJQTBDekYsSUFBTSxxQkFBcUIsR0FBM0IsTUFBTSxxQkFBc0IsU0FBUSxzQkFBVTs7aUJBRXJDLG1CQUFjLEdBQUcsQ0FBQyxjQUFjLEVBQUUsbUJBQW1CLEVBQUUsZUFBZSxFQUFFLGVBQWUsRUFBRSxZQUFZLEVBQUUsZ0JBQWdCLEVBQUUsYUFBYSxFQUFFLGVBQWUsQ0FBQyxBQUExSSxDQUEySTtpQkFDekosNkJBQXdCLEdBQUcsQ0FBQyxlQUFlLEVBQUUsaUJBQWlCLEVBQUUsWUFBWSxFQUFFLGFBQWEsQ0FBQyxBQUFwRSxDQUFxRTtRQUU1RyxZQUNxQyxnQkFBbUMsRUFDNUIsY0FBd0MsRUFDaEUsZ0JBQW1DLEVBQ3RDLGFBQTZCLEVBQ3pCLGtCQUFzQyxFQUNsQyxZQUFvQyxFQUM5QixrQkFBZ0QsRUFDcEMsc0JBQStDLEVBQ2xFLG9CQUEyQyxFQUN2QyxvQkFBK0MsRUFDeEQsZUFBaUM7WUFFbkQsS0FBSyxFQUFFLENBQUM7WUFaNEIscUJBQWdCLEdBQWhCLGdCQUFnQixDQUFtQjtZQUM1QixtQkFBYyxHQUFkLGNBQWMsQ0FBMEI7WUFNekMsMkJBQXNCLEdBQXRCLHNCQUFzQixDQUF5QjtZQU96RixNQUFNLEVBQUUsbUJBQW1CLEVBQUUsV0FBVyxFQUFFLFlBQVksRUFBRSxHQUFHLGtCQUFrQixDQUFDO1lBQzlFLE1BQU0sYUFBYSxHQUFHLG9CQUFvQixDQUFDLHNCQUFzQix1Q0FBK0IsQ0FBQztZQTJDakcsZ0JBQWdCLENBQUMsVUFBVSxDQUFrRCxlQUFlLEVBQUU7Z0JBQzdGLFVBQVUsRUFB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