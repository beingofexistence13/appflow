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
define(["require", "exports", "vs/base/common/arrays", "vs/base/common/event", "vs/base/common/json", "vs/base/common/lifecycle", "vs/editor/common/services/getIconClasses", "vs/platform/files/common/files", "vs/platform/instantiation/common/extensions", "vs/platform/instantiation/common/instantiation", "vs/platform/workspace/common/workspace", "vs/platform/quickinput/common/quickInput", "vs/editor/common/services/model", "vs/editor/common/languages/language", "vs/nls!vs/workbench/services/extensionRecommendations/common/workspaceExtensionsConfig", "vs/workbench/services/configuration/common/jsonEditing", "vs/base/common/map"], function (require, exports, arrays_1, event_1, json_1, lifecycle_1, getIconClasses_1, files_1, extensions_1, instantiation_1, workspace_1, quickInput_1, model_1, language_1, nls_1, jsonEditing_1, map_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$rgb = exports.$qgb = exports.$pgb = void 0;
    exports.$pgb = '.vscode/extensions.json';
    exports.$qgb = (0, instantiation_1.$Bh)('IWorkspaceExtensionsConfigService');
    let $rgb = class $rgb extends lifecycle_1.$kc {
        constructor(b, f, g, h, j, m) {
            super();
            this.b = b;
            this.f = f;
            this.g = g;
            this.h = h;
            this.j = j;
            this.m = m;
            this.a = this.B(new event_1.$fd());
            this.onDidChangeExtensionsConfigs = this.a.event;
            this.B(b.onDidChangeWorkspaceFolders(e => this.a.fire()));
            this.B(f.onDidFilesChange(e => {
                const workspace = b.getWorkspace();
                if ((workspace.configuration && e.affects(workspace.configuration))
                    || workspace.folders.some(folder => e.affects(folder.toResource(exports.$pgb)))) {
                    this.a.fire();
                }
            }));
        }
        async getExtensionsConfigs() {
            const workspace = this.b.getWorkspace();
            const result = [];
            const workspaceExtensionsConfigContent = workspace.configuration ? await this.y(workspace.configuration) : undefined;
            if (workspaceExtensionsConfigContent) {
                result.push(workspaceExtensionsConfigContent);
            }
            result.push(...await Promise.all(workspace.folders.map(workspaceFolder => this.z(workspaceFolder))));
            return result;
        }
        async getRecommendations() {
            const configs = await this.getExtensionsConfigs();
            return (0, arrays_1.$Kb)((0, arrays_1.$Pb)(configs.map(c => c.recommendations ? c.recommendations.map(c => c.toLowerCase()) : [])));
        }
        async getUnwantedRecommendations() {
            const configs = await this.getExtensionsConfigs();
            return (0, arrays_1.$Kb)((0, arrays_1.$Pb)(configs.map(c => c.unwantedRecommendations ? c.unwantedRecommendations.map(c => c.toLowerCase()) : [])));
        }
        async toggleRecommendation(extensionId) {
            extensionId = extensionId.toLowerCase();
            const workspace = this.b.getWorkspace();
            const workspaceExtensionsConfigContent = workspace.configuration ? await this.y(workspace.configuration) : undefined;
            const workspaceFolderExtensionsConfigContents = new map_1.$zi();
            await Promise.all(workspace.folders.map(async (workspaceFolder) => {
                const extensionsConfigContent = await this.z(workspaceFolder);
                workspaceFolderExtensionsConfigContents.set(workspaceFolder.uri, extensionsConfigContent);
            }));
            const isWorkspaceRecommended = workspaceExtensionsConfigContent && workspaceExtensionsConfigContent.recommendations?.some(r => r.toLowerCase() === extensionId);
            const recommendedWorksapceFolders = workspace.folders.filter(workspaceFolder => workspaceFolderExtensionsConfigContents.get(workspaceFolder.uri)?.recommendations?.some(r => r.toLowerCase() === extensionId));
            const isRecommended = isWorkspaceRecommended || recommendedWorksapceFolders.length > 0;
            const workspaceOrFolders = isRecommended
                ? await this.w(recommendedWorksapceFolders, isWorkspaceRecommended ? workspace : undefined, (0, nls_1.localize)(0, null))
                : await this.w(workspace.folders, workspace.configuration ? workspace : undefined, (0, nls_1.localize)(1, null));
            for (const workspaceOrWorkspaceFolder of workspaceOrFolders) {
                if ((0, workspace_1.$Sh)(workspaceOrWorkspaceFolder)) {
                    await this.s(extensionId, workspaceOrWorkspaceFolder, workspaceExtensionsConfigContent, !isRecommended);
                }
                else {
                    await this.n(extensionId, workspaceOrWorkspaceFolder, workspaceFolderExtensionsConfigContents.get(workspaceOrWorkspaceFolder.uri), !isRecommended);
                }
            }
        }
        async toggleUnwantedRecommendation(extensionId) {
            const workspace = this.b.getWorkspace();
            const workspaceExtensionsConfigContent = workspace.configuration ? await this.y(workspace.configuration) : undefined;
            const workspaceFolderExtensionsConfigContents = new map_1.$zi();
            await Promise.all(workspace.folders.map(async (workspaceFolder) => {
                const extensionsConfigContent = await this.z(workspaceFolder);
                workspaceFolderExtensionsConfigContents.set(workspaceFolder.uri, extensionsConfigContent);
            }));
            const isWorkspaceUnwanted = workspaceExtensionsConfigContent && workspaceExtensionsConfigContent.unwantedRecommendations?.some(r => r === extensionId);
            const unWantedWorksapceFolders = workspace.folders.filter(workspaceFolder => workspaceFolderExtensionsConfigContents.get(workspaceFolder.uri)?.unwantedRecommendations?.some(r => r === extensionId));
            const isUnwanted = isWorkspaceUnwanted || unWantedWorksapceFolders.length > 0;
            const workspaceOrFolders = isUnwanted
                ? await this.w(unWantedWorksapceFolders, isWorkspaceUnwanted ? workspace : undefined, (0, nls_1.localize)(2, null))
                : await this.w(workspace.folders, workspace.configuration ? workspace : undefined, (0, nls_1.localize)(3, null));
            for (const workspaceOrWorkspaceFolder of workspaceOrFolders) {
                if ((0, workspace_1.$Sh)(workspaceOrWorkspaceFolder)) {
                    await this.u(extensionId, workspaceOrWorkspaceFolder, workspaceExtensionsConfigContent, !isUnwanted);
                }
                else {
                    await this.t(extensionId, workspaceOrWorkspaceFolder, workspaceFolderExtensionsConfigContents.get(workspaceOrWorkspaceFolder.uri), !isUnwanted);
                }
            }
        }
        async n(extensionId, workspaceFolder, extensionsConfigContent, add) {
            const values = [];
            if (add) {
                values.push({ path: ['recommendations'], value: [...extensionsConfigContent.recommendations || [], extensionId] });
                if (extensionsConfigContent.unwantedRecommendations && extensionsConfigContent.unwantedRecommendations.some(e => e === extensionId)) {
                    values.push({ path: ['unwantedRecommendations'], value: extensionsConfigContent.unwantedRecommendations.filter(e => e !== extensionId) });
                }
            }
            else if (extensionsConfigContent.recommendations) {
                values.push({ path: ['recommendations'], value: extensionsConfigContent.recommendations.filter(e => e !== extensionId) });
            }
            if (values.length) {
                return this.m.write(workspaceFolder.toResource(exports.$pgb), values, true);
            }
        }
        async s(extensionId, workspace, extensionsConfigContent, add) {
            const values = [];
            if (extensionsConfigContent) {
                if (add) {
                    values.push({ path: ['extensions', 'recommendations'], value: [...extensionsConfigContent.recommendations || [], extensionId] });
                    if (extensionsConfigContent.unwantedRecommendations && extensionsConfigContent.unwantedRecommendations.some(e => e === extensionId)) {
                        values.push({ path: ['extensions', 'unwantedRecommendations'], value: extensionsConfigContent.unwantedRecommendations.filter(e => e !== extensionId) });
                    }
                }
                else if (extensionsConfigContent.recommendations) {
                    values.push({ path: ['extensions', 'recommendations'], value: extensionsConfigContent.recommendations.filter(e => e !== extensionId) });
                }
            }
            else if (add) {
                values.push({ path: ['extensions'], value: { recommendations: [extensionId] } });
            }
            if (values.length) {
                return this.m.write(workspace.configuration, values, true);
            }
        }
        async t(extensionId, workspaceFolder, extensionsConfigContent, add) {
            const values = [];
            if (add) {
                values.push({ path: ['unwantedRecommendations'], value: [...extensionsConfigContent.unwantedRecommendations || [], extensionId] });
                if (extensionsConfigContent.recommendations && extensionsConfigContent.recommendations.some(e => e === extensionId)) {
                    values.push({ path: ['recommendations'], value: extensionsConfigContent.recommendations.filter(e => e !== extensionId) });
                }
            }
            else if (extensionsConfigContent.unwantedRecommendations) {
                values.push({ path: ['unwantedRecommendations'], value: extensionsConfigContent.unwantedRecommendations.filter(e => e !== extensionId) });
            }
            if (values.length) {
                return this.m.write(workspaceFolder.toResource(exports.$pgb), values, true);
            }
        }
        async u(extensionId, workspace, extensionsConfigContent, add) {
            const values = [];
            if (extensionsConfigContent) {
                if (add) {
                    values.push({ path: ['extensions', 'unwantedRecommendations'], value: [...extensionsConfigContent.unwantedRecommendations || [], extensionId] });
                    if (extensionsConfigContent.recommendations && extensionsConfigContent.recommendations.some(e => e === extensionId)) {
                        values.push({ path: ['extensions', 'recommendations'], value: extensionsConfigContent.recommendations.filter(e => e !== extensionId) });
                    }
                }
                else if (extensionsConfigContent.unwantedRecommendations) {
                    values.push({ path: ['extensions', 'unwantedRecommendations'], value: extensionsConfigContent.unwantedRecommendations.filter(e => e !== extensionId) });
                }
            }
            else if (add) {
                values.push({ path: ['extensions'], value: { unwantedRecommendations: [extensionId] } });
            }
            if (values.length) {
                return this.m.write(workspace.configuration, values, true);
            }
        }
        async w(workspaceFolders, workspace, placeHolder) {
            const workspaceOrFolders = workspace ? [...workspaceFolders, workspace] : [...workspaceFolders];
            if (workspaceOrFolders.length === 1) {
                return workspaceOrFolders;
            }
            const folderPicks = workspaceFolders.map(workspaceFolder => {
                return {
                    label: workspaceFolder.name,
                    description: (0, nls_1.localize)(4, null),
                    workspaceOrFolder: workspaceFolder,
                    iconClasses: (0, getIconClasses_1.$x6)(this.h, this.j, workspaceFolder.uri, files_1.FileKind.ROOT_FOLDER)
                };
            });
            if (workspace) {
                folderPicks.push({ type: 'separator' });
                folderPicks.push({
                    label: (0, nls_1.localize)(5, null),
                    workspaceOrFolder: workspace,
                });
            }
            const result = await this.g.pick(folderPicks, { placeHolder, canPickMany: true }) || [];
            return result.map(r => r.workspaceOrFolder);
        }
        async y(workspaceConfigurationResource) {
            try {
                const content = await this.f.readFile(workspaceConfigurationResource);
                const extensionsConfigContent = (0, json_1.$Lm)(content.value.toString())['extensions'];
                return extensionsConfigContent ? this.C(extensionsConfigContent) : undefined;
            }
            catch (e) { /* Ignore */ }
            return undefined;
        }
        async z(workspaceFolder) {
            try {
                const content = await this.f.readFile(workspaceFolder.toResource(exports.$pgb));
                const extensionsConfigContent = (0, json_1.$Lm)(content.value.toString());
                return this.C(extensionsConfigContent);
            }
            catch (e) { /* ignore */ }
            return {};
        }
        C(extensionsConfigContent) {
            return {
                recommendations: (0, arrays_1.$Kb)((extensionsConfigContent.recommendations || []).map(e => e.toLowerCase())),
                unwantedRecommendations: (0, arrays_1.$Kb)((extensionsConfigContent.unwantedRecommendations || []).map(e => e.toLowerCase()))
            };
        }
    };
    exports.$rgb = $rgb;
    exports.$rgb = $rgb = __decorate([
        __param(0, workspace_1.$Kh),
        __param(1, files_1.$6j),
        __param(2, quickInput_1.$Gq),
        __param(3, model_1.$yA),
        __param(4, language_1.$ct),
        __param(5, jsonEditing_1.$$fb)
    ], $rgb);
    (0, extensions_1.$mr)(exports.$qgb, $rgb, 1 /* InstantiationType.Delayed */);
});
//# sourceMappingURL=workspaceExtensionsConfig.js.map