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
    exports.$occ = exports.$ncc = void 0;
    exports.$ncc = (0, instantiation_1.$Bh)('IExtHostVariableResolverProvider');
    class ExtHostVariableResolverService extends variableResolver_1.$3M {
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
                        if (activeTab.input instanceof extHostTypes_1.$IL || activeTab.input instanceof extHostTypes_1.$NL) {
                            return activeTab.input.modified;
                        }
                        else if (activeTab.input instanceof extHostTypes_1.$HL || activeTab.input instanceof extHostTypes_1.$ML || activeTab.input instanceof extHostTypes_1.$KL) {
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
                        return path.$7d(activeUri.fsPath);
                    }
                    return undefined;
                },
                getWorkspaceFolderPathForFile: () => {
                    if (workspaceService) {
                        const activeUri = getActiveUri();
                        if (activeUri) {
                            const ws = workspaceService.getWorkspaceFolder(activeUri);
                            if (ws) {
                                return path.$7d(ws.uri.fsPath);
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
    let $occ = class $occ extends lifecycle_1.$kc {
        constructor(b, c, g, h, j) {
            super();
            this.b = b;
            this.c = c;
            this.g = g;
            this.h = h;
            this.j = j;
            this.a = new lazy_1.$T(async () => {
                const configProvider = await this.h.getConfigProvider();
                const folders = await this.c.getWorkspaceFolders2() || [];
                const dynamic = { folders };
                this.B(this.c.onDidChangeWorkspace(async (e) => {
                    dynamic.folders = await this.c.getWorkspaceFolders2() || [];
                }));
                return new ExtHostVariableResolverService(this.b, this.c, this.g, this.j, configProvider, dynamic, this.m());
            });
        }
        getResolver() {
            return this.a.value;
        }
        m() {
            return undefined;
        }
    };
    exports.$occ = $occ;
    exports.$occ = $occ = __decorate([
        __param(0, extHostExtensionService_1.$Rbc),
        __param(1, extHostWorkspace_1.$jbc),
        __param(2, extHostDocumentsAndEditors_1.$aM),
        __param(3, extHostConfiguration_1.$mbc),
        __param(4, extHostEditorTabs_1.$lcc)
    ], $occ);
});
//# sourceMappingURL=extHostVariableResolverService.js.map