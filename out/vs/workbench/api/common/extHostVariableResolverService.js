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
define(["require", "exports", "vs/base/common/lazy", "vs/base/common/lifecycle", "vs/base/common/path", "vs/base/common/process", "vs/platform/instantiation/common/instantiation", "vs/workbench/api/common/extHostDocumentsAndEditors", "vs/workbench/api/common/extHostEditorTabs", "vs/workbench/api/common/extHostExtensionService", "vs/workbench/api/common/extHostTypes", "vs/workbench/api/common/extHostWorkspace", "vs/workbench/services/configurationResolver/common/variableResolver", "./extHostConfiguration"], function (require, exports, lazy_1, lifecycle_1, path, process, instantiation_1, extHostDocumentsAndEditors_1, extHostEditorTabs_1, extHostExtensionService_1, extHostTypes_1, extHostWorkspace_1, variableResolver_1, extHostConfiguration_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.ExtHostVariableResolverProviderService = exports.IExtHostVariableResolverProvider = void 0;
    exports.IExtHostVariableResolverProvider = (0, instantiation_1.createDecorator)('IExtHostVariableResolverProvider');
    class ExtHostVariableResolverService extends variableResolver_1.AbstractVariableResolverService {
        constructor(extensionService, workspaceService, editorService, editorTabs, configProvider, context, homeDir) {
            function getActiveUri() {
                if (editorService) {
                    const activeEditor = editorService.activeEditor();
                    if (activeEditor) {
                        return activeEditor.document.uri;
                    }
                    const activeTab = editorTabs.tabGroups.all.find(group => group.isActive)?.activeTab;
                    if (activeTab !== undefined) {
                        // Resolve a resource from the tab
                        if (activeTab.input instanceof extHostTypes_1.TextDiffTabInput || activeTab.input instanceof extHostTypes_1.NotebookDiffEditorTabInput) {
                            return activeTab.input.modified;
                        }
                        else if (activeTab.input instanceof extHostTypes_1.TextTabInput || activeTab.input instanceof extHostTypes_1.NotebookEditorTabInput || activeTab.input instanceof extHostTypes_1.CustomEditorTabInput) {
                            return activeTab.input.uri;
                        }
                    }
                }
                return undefined;
            }
            super({
                getFolderUri: (folderName) => {
                    const found = context.folders.filter(f => f.name === folderName);
                    if (found && found.length > 0) {
                        return found[0].uri;
                    }
                    return undefined;
                },
                getWorkspaceFolderCount: () => {
                    return context.folders.length;
                },
                getConfigurationValue: (folderUri, section) => {
                    return configProvider.getConfiguration(undefined, folderUri).get(section);
                },
                getAppRoot: () => {
                    return process.cwd();
                },
                getExecPath: () => {
                    return process.env['VSCODE_EXEC_PATH'];
                },
                getFilePath: () => {
                    const activeUri = getActiveUri();
                    if (activeUri) {
                        return path.normalize(activeUri.fsPath);
                    }
                    return undefined;
                },
                getWorkspaceFolderPathForFile: () => {
                    if (workspaceService) {
                        const activeUri = getActiveUri();
                        if (activeUri) {
                            const ws = workspaceService.getWorkspaceFolder(activeUri);
                            if (ws) {
                                return path.normalize(ws.uri.fsPath);
                            }
                        }
                    }
                    return undefined;
                },
                getSelectedText: () => {
                    if (editorService) {
                        const activeEditor = editorService.activeEditor();
                        if (activeEditor && !activeEditor.selection.isEmpty) {
                            return activeEditor.document.getText(activeEditor.selection);
                        }
                    }
                    return undefined;
                },
                getLineNumber: () => {
                    if (editorService) {
                        const activeEditor = editorService.activeEditor();
                        if (activeEditor) {
                            return String(activeEditor.selection.end.line + 1);
                        }
                    }
                    return undefined;
                },
                getExtension: (id) => {
                    return extensionService.getExtension(id);
                },
            }, undefined, homeDir ? Promise.resolve(homeDir) : undefined, Promise.resolve(process.env));
        }
    }
    let ExtHostVariableResolverProviderService = class ExtHostVariableResolverProviderService extends lifecycle_1.Disposable {
        constructor(extensionService, workspaceService, editorService, configurationService, editorTabs) {
            super();
            this.extensionService = extensionService;
            this.workspaceService = workspaceService;
            this.editorService = editorService;
            this.configurationService = configurationService;
            this.editorTabs = editorTabs;
            this._resolver = new lazy_1.Lazy(async () => {
                const configProvider = await this.configurationService.getConfigProvider();
                const folders = await this.workspaceService.getWorkspaceFolders2() || [];
                const dynamic = { folders };
                this._register(this.workspaceService.onDidChangeWorkspace(async (e) => {
                    dynamic.folders = await this.workspaceService.getWorkspaceFolders2() || [];
                }));
                return new ExtHostVariableResolverService(this.extensionService, this.workspaceService, this.editorService, this.editorTabs, configProvider, dynamic, this.homeDir());
            });
        }
        getResolver() {
            return this._resolver.value;
        }
        homeDir() {
            return undefined;
        }
    };
    exports.ExtHostVariableResolverProviderService = ExtHostVariableResolverProviderService;
    exports.ExtHostVariableResolverProviderService = ExtHostVariableResolverProviderService = __decorate([
        __param(0, extHostExtensionService_1.IExtHostExtensionService),
        __param(1, extHostWorkspace_1.IExtHostWorkspace),
        __param(2, extHostDocumentsAndEditors_1.IExtHostDocumentsAndEditors),
        __param(3, extHostConfiguration_1.IExtHostConfiguration),
        __param(4, extHostEditorTabs_1.IExtHostEditorTabs)
    ], ExtHostVariableResolverProviderService);
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZXh0SG9zdFZhcmlhYmxlUmVzb2x2ZXJTZXJ2aWNlLmpzIiwic291cmNlUm9vdCI6ImZpbGU6Ly8vd29ya3NwYWNlL2FwcGZsb3cvc3JjLyIsInNvdXJjZXMiOlsidnMvd29ya2JlbmNoL2FwaS9jb21tb24vZXh0SG9zdFZhcmlhYmxlUmVzb2x2ZXJTZXJ2aWNlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Z0dBR2dHOzs7Ozs7Ozs7Ozs7OztJQXVCbkYsUUFBQSxnQ0FBZ0MsR0FBRyxJQUFBLCtCQUFlLEVBQW1DLGtDQUFrQyxDQUFDLENBQUM7SUFNdEksTUFBTSw4QkFBK0IsU0FBUSxrREFBK0I7UUFFM0UsWUFDQyxnQkFBMEMsRUFDMUMsZ0JBQW1DLEVBQ25DLGFBQTBDLEVBQzFDLFVBQThCLEVBQzlCLGNBQXFDLEVBQ3JDLE9BQXVCLEVBQ3ZCLE9BQTJCO1lBRTNCLFNBQVMsWUFBWTtnQkFDcEIsSUFBSSxhQUFhLEVBQUU7b0JBQ2xCLE1BQU0sWUFBWSxHQUFHLGFBQWEsQ0FBQyxZQUFZLEVBQUUsQ0FBQztvQkFDbEQsSUFBSSxZQUFZLEVBQUU7d0JBQ2pCLE9BQU8sWUFBWSxDQUFDLFFBQVEsQ0FBQyxHQUFHLENBQUM7cUJBQ2pDO29CQUNELE1BQU0sU0FBUyxHQUFHLFVBQVUsQ0FBQyxTQUFTLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsRUFBRSxDQUFDLEtBQUssQ0FBQyxRQUFRLENBQUMsRUFBRSxTQUFTLENBQUM7b0JBQ3BGLElBQUksU0FBUyxLQUFLLFNBQVMsRUFBRTt3QkFDNUIsa0NBQWtDO3dCQUNsQyxJQUFJLFNBQVMsQ0FBQyxLQUFLLFlBQVksK0JBQWdCLElBQUksU0FBUyxDQUFDLEtBQUssWUFBWSx5Q0FBMEIsRUFBRTs0QkFDekcsT0FBTyxTQUFTLENBQUMsS0FBSyxDQUFDLFFBQVEsQ0FBQzt5QkFDaEM7NkJBQU0sSUFBSSxTQUFTLENBQUMsS0FBSyxZQUFZLDJCQUFZLElBQUksU0FBUyxDQUFDLEtB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