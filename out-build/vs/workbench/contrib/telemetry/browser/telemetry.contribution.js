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
    var $TBb_1;
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$TBb = void 0;
    let $TBb = class $TBb extends lifecycle_2.$kc {
        static { $TBb_1 = this; }
        static { this.a = ['package.json', 'package-lock.json', 'tsconfig.json', 'jsconfig.json', 'bower.json', '.eslintrc.json', 'tslint.json', 'composer.json']; }
        static { this.b = ['settings.json', 'extensions.json', 'tasks.json', 'launch.json']; }
        constructor(c, f, lifecycleService, editorService, keybindingsService, themeService, environmentService, g, configurationService, paneCompositeService, textFileService) {
            super();
            this.c = c;
            this.f = f;
            this.g = g;
            const { filesToOpenOrCreate, filesToDiff, filesToMerge } = environmentService;
            const activeViewlet = paneCompositeService.getActivePaneComposite(0 /* ViewContainerLocation.Sidebar */);
            c.publicLog2('workspaceLoad', {
                windowSize: { innerHeight: window.innerHeight, innerWidth: window.innerWidth, outerHeight: window.outerHeight, outerWidth: window.outerWidth },
                emptyWorkbench: f.getWorkbenchState() === 1 /* WorkbenchState.EMPTY */,
                'workbench.filesToOpenOrCreate': filesToOpenOrCreate && filesToOpenOrCreate.length || 0,
                'workbench.filesToDiff': filesToDiff && filesToDiff.length || 0,
                'workbench.filesToMerge': filesToMerge && filesToMerge.length || 0,
                customKeybindingsCount: keybindingsService.customKeybindingsCount(),
                theme: themeService.getColorTheme().id,
                language: platform_2.$v,
                pinnedViewlets: paneCompositeService.getPinnedPaneCompositeIds(0 /* ViewContainerLocation.Sidebar */),
                restoredViewlet: activeViewlet ? activeViewlet.getId() : undefined,
                restoredEditors: editorService.visibleEditors.length,
                startupKind: lifecycleService.startupKind
            });
            // Error Telemetry
            this.B(new errorTelemetry_1.default(c));
            // Configuration Telemetry
            this.B((0, telemetryUtils_1.$go)(c, configurationService));
            //  Files Telemetry
            this.B(textFileService.files.onDidResolve(e => this.h(e)));
            this.B(textFileService.files.onDidSave(e => this.j(e)));
            // Lifecycle
            this.B(lifecycleService.onDidShutdown(() => this.dispose()));
        }
        h(e) {
            const settingsType = this.m(e.model.resource);
            if (settingsType) {
                this.c.publicLog2('settingsRead', { settingsType }); // Do not log read to user settings.json and .vscode folder as a fileGet event as it ruins our JSON usage data
            }
            else {
                this.c.publicLog2('fileGet', this.n(e.model.resource, e.reason));
            }
        }
        j(e) {
            const settingsType = this.m(e.model.resource);
            if (settingsType) {
                this.c.publicLog2('settingsWritten', { settingsType }); // Do not log write to user settings.json and .vscode folder as a filePUT event as it ruins our JSON usage data
            }
            else {
                this.c.publicLog2('filePUT', this.n(e.model.resource, e.reason));
            }
        }
        m(resource) {
            if ((0, resources_1.$gg)(resource) !== '.json') {
                return '';
            }
            // Check for global settings file
            if ((0, resources_1.$bg)(resource, this.g.currentProfile.settingsResource)) {
                return 'global-settings';
            }
            // Check for keybindings file
            if ((0, resources_1.$bg)(resource, this.g.currentProfile.keybindingsResource)) {
                return 'keybindings';
            }
            // Check for snippets
            if ((0, resources_1.$cg)(resource, this.g.currentProfile.snippetsHome)) {
                return 'snippets';
            }
            // Check for workspace settings file
            const folders = this.f.getWorkspace().folders;
            for (const folder of folders) {
                if ((0, resources_1.$cg)(resource, folder.toResource('.vscode'))) {
                    const filename = (0, resources_1.$fg)(resource);
                    if ($TBb_1.b.indexOf(filename) > -1) {
                        return `.vscode/${filename}`;
                    }
                }
            }
            return '';
        }
        n(resource, reason) {
            let ext = (0, resources_1.$gg)(resource);
            // Remove query parameters from the resource extension
            const queryStringLocation = ext.indexOf('?');
            ext = queryStringLocation !== -1 ? ext.substr(0, queryStringLocation) : ext;
            const fileName = (0, resources_1.$fg)(resource);
            const path = resource.scheme === network_1.Schemas.file ? resource.fsPath : resource.path;
            const telemetryData = {
                mimeType: new telemetryUtils_1.$_n((0, languagesAssociations_1.$fmb)(resource).join(', ')),
                ext,
                path: (0, hash_1.$pi)(path),
                reason,
                allowlistedjson: undefined
            };
            if (ext === '.json' && $TBb_1.a.indexOf(fileName) > -1) {
                telemetryData['allowlistedjson'] = fileName;
            }
            return telemetryData;
        }
    };
    exports.$TBb = $TBb;
    exports.$TBb = $TBb = $TBb_1 = __decorate([
        __param(0, telemetry_1.$9k),
        __param(1, workspace_1.$Kh),
        __param(2, lifecycle_1.$7y),
        __param(3, editorService_1.$9C),
        __param(4, keybinding_1.$2D),
        __param(5, workbenchThemeService_1.$egb),
        __param(6, environmentService_1.$hJ),
        __param(7, userDataProfile_1.$CJ),
        __param(8, configuration_1.$8h),
        __param(9, panecomposite_1.$Yeb),
        __param(10, textfiles_1.$JD)
    ], $TBb);
    platform_1.$8m.as(contributions_1.Extensions.Workbench).registerWorkbenchContribution($TBb, 3 /* LifecyclePhase.Restored */);
});
//# sourceMappingURL=telemetry.contribution.js.map