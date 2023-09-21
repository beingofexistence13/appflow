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
define(["require", "exports", "vs/workbench/services/host/browser/host", "vs/platform/dialogs/common/dialogs", "vs/platform/workspace/common/workspace", "vs/workbench/services/history/common/history", "vs/workbench/services/environment/common/environmentService", "vs/base/common/uri", "vs/platform/instantiation/common/instantiation", "vs/platform/configuration/common/configuration", "vs/platform/instantiation/common/extensions", "vs/platform/files/common/files", "vs/platform/opener/common/opener", "vs/platform/native/common/native", "vs/workbench/services/dialogs/browser/abstractFileDialogService", "vs/base/common/network", "vs/editor/common/languages/language", "vs/platform/workspaces/common/workspaces", "vs/platform/label/common/label", "vs/workbench/services/path/common/pathService", "vs/platform/commands/common/commands", "vs/editor/browser/services/codeEditorService", "vs/workbench/services/editor/common/editorService", "vs/platform/log/common/log"], function (require, exports, host_1, dialogs_1, workspace_1, history_1, environmentService_1, uri_1, instantiation_1, configuration_1, extensions_1, files_1, opener_1, native_1, abstractFileDialogService_1, network_1, language_1, workspaces_1, label_1, pathService_1, commands_1, codeEditorService_1, editorService_1, log_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$y_b = void 0;
    let $y_b = class $y_b extends abstractFileDialogService_1.$_3b {
        constructor(hostService, contextService, historyService, environmentService, instantiationService, configurationService, fileService, openerService, K, dialogService, languageService, workspacesService, labelService, pathService, commandService, editorService, codeEditorService, logService) {
            super(hostService, contextService, historyService, environmentService, instantiationService, configurationService, fileService, openerService, dialogService, languageService, workspacesService, labelService, pathService, commandService, editorService, codeEditorService, logService);
            this.K = K;
        }
        L(options) {
            return {
                forceNewWindow: options.forceNewWindow,
                telemetryExtraData: options.telemetryExtraData,
                defaultPath: options.defaultUri?.fsPath
            };
        }
        M(schema) {
            const setting = (this.g.getValue('files.simpleDialog.enable') === true);
            const newWindowSetting = (this.g.getValue('window.openFilesInNewWindow') === 'on');
            return {
                useSimplified: ((schema !== network_1.Schemas.file) && (schema !== network_1.Schemas.vscodeUserData)) || setting,
                isSetting: newWindowSetting
            };
        }
        async pickFileFolderAndOpen(options) {
            const schema = this.H(options);
            if (!options.defaultUri) {
                options.defaultUri = await this.defaultFilePath(schema);
            }
            const shouldUseSimplified = this.M(schema);
            if (shouldUseSimplified.useSimplified) {
                return this.v(schema, options, shouldUseSimplified.isSetting);
            }
            return this.K.pickFileFolderAndOpen(this.L(options));
        }
        async pickFileAndOpen(options) {
            const schema = this.H(options);
            if (!options.defaultUri) {
                options.defaultUri = await this.defaultFilePath(schema);
            }
            const shouldUseSimplified = this.M(schema);
            if (shouldUseSimplified.useSimplified) {
                return this.w(schema, options, shouldUseSimplified.isSetting);
            }
            return this.K.pickFileAndOpen(this.L(options));
        }
        async pickFolderAndOpen(options) {
            const schema = this.H(options);
            if (!options.defaultUri) {
                options.defaultUri = await this.defaultFolderPath(schema);
            }
            if (this.M(schema).useSimplified) {
                return this.y(schema, options);
            }
            return this.K.pickFolderAndOpen(this.L(options));
        }
        async pickWorkspaceAndOpen(options) {
            options.availableFileSystems = this.I(options);
            const schema = this.H(options);
            if (!options.defaultUri) {
                options.defaultUri = await this.defaultWorkspacePath(schema);
            }
            if (this.M(schema).useSimplified) {
                return this.z(schema, options);
            }
            return this.K.pickWorkspaceAndOpen(this.L(options));
        }
        async pickFileToSave(defaultUri, availableFileSystems) {
            const schema = this.H({ defaultUri, availableFileSystems });
            const options = this.J(defaultUri, availableFileSystems);
            if (this.M(schema).useSimplified) {
                return this.A(schema, options);
            }
            else {
                const result = await this.K.showSaveDialog(this.N(options));
                if (result && !result.canceled && result.filePath) {
                    const uri = uri_1.URI.file(result.filePath);
                    this.x(uri);
                    return uri;
                }
            }
            return;
        }
        N(options) {
            options.defaultUri = options.defaultUri ? uri_1.URI.file(options.defaultUri.path) : undefined;
            return {
                defaultPath: options.defaultUri?.fsPath,
                buttonLabel: options.saveLabel,
                filters: options.filters,
                title: options.title
            };
        }
        async showSaveDialog(options) {
            const schema = this.H(options);
            if (this.M(schema).useSimplified) {
                return this.B(schema, options);
            }
            const result = await this.K.showSaveDialog(this.N(options));
            if (result && !result.canceled && result.filePath) {
                return uri_1.URI.file(result.filePath);
            }
            return;
        }
        async showOpenDialog(options) {
            const schema = this.H(options);
            if (this.M(schema).useSimplified) {
                return this.C(schema, options);
            }
            const newOptions = {
                title: options.title,
                defaultPath: options.defaultUri?.fsPath,
                buttonLabel: options.openLabel,
                filters: options.filters,
                properties: []
            };
            newOptions.properties.push('createDirectory');
            if (options.canSelectFiles) {
                newOptions.properties.push('openFile');
            }
            if (options.canSelectFolders) {
                newOptions.properties.push('openDirectory');
            }
            if (options.canSelectMany) {
                newOptions.properties.push('multiSelections');
            }
            const result = await this.K.showOpenDialog(newOptions);
            return result && Array.isArray(result.filePaths) && result.filePaths.length > 0 ? result.filePaths.map(uri_1.URI.file) : undefined;
        }
    };
    exports.$y_b = $y_b;
    exports.$y_b = $y_b = __decorate([
        __param(0, host_1.$VT),
        __param(1, workspace_1.$Kh),
        __param(2, history_1.$SM),
        __param(3, environmentService_1.$hJ),
        __param(4, instantiation_1.$Ah),
        __param(5, configuration_1.$8h),
        __param(6, files_1.$6j),
        __param(7, opener_1.$NT),
        __param(8, native_1.$05b),
        __param(9, dialogs_1.$oA),
        __param(10, language_1.$ct),
        __param(11, workspaces_1.$fU),
        __param(12, label_1.$Vz),
        __param(13, pathService_1.$yJ),
        __param(14, commands_1.$Fr),
        __param(15, editorService_1.$9C),
        __param(16, codeEditorService_1.$nV),
        __param(17, log_1.$5i)
    ], $y_b);
    (0, extensions_1.$mr)(dialogs_1.$qA, $y_b, 1 /* InstantiationType.Delayed */);
});
//# sourceMappingURL=fileDialogService.js.map