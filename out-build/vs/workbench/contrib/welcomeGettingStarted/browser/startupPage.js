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
define(["require", "exports", "vs/platform/commands/common/commands", "vs/base/common/arrays", "vs/platform/instantiation/common/instantiation", "vs/workbench/services/editor/common/editorService", "vs/base/common/errors", "vs/platform/workspace/common/workspace", "vs/platform/configuration/common/configuration", "vs/workbench/services/workingCopy/common/workingCopyBackup", "vs/workbench/services/lifecycle/common/lifecycle", "vs/platform/files/common/files", "vs/base/common/resources", "vs/workbench/services/layout/browser/layoutService", "vs/workbench/contrib/welcomeGettingStarted/browser/gettingStartedInput", "vs/workbench/services/environment/common/environmentService", "vs/platform/storage/common/storage", "vs/platform/telemetry/common/telemetryUtils", "vs/platform/product/common/productService", "vs/platform/log/common/log", "vs/platform/notification/common/notification", "vs/nls!vs/workbench/contrib/welcomeGettingStarted/browser/startupPage", "vs/workbench/services/editor/common/editorResolverService"], function (require, exports, commands_1, arrays, instantiation_1, editorService_1, errors_1, workspace_1, configuration_1, workingCopyBackup_1, lifecycle_1, files_1, resources_1, layoutService_1, gettingStartedInput_1, environmentService_1, storage_1, telemetryUtils_1, productService_1, log_1, notification_1, nls_1, editorResolverService_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$PYb = exports.$OYb = void 0;
    exports.$OYb = 'workbench.welcomePage.restorableWalkthroughs';
    const configurationKey = 'workbench.startupEditor';
    const oldConfigurationKey = 'workbench.welcome.enabled';
    const telemetryOptOutStorageKey = 'workbench.telemetryOptOutShown';
    let $PYb = class $PYb {
        constructor(a, b, c, d, f, g, h, i, j, k, l, m, n, o, editorResolverService) {
            this.a = a;
            this.b = b;
            this.c = c;
            this.d = d;
            this.f = f;
            this.g = g;
            this.h = h;
            this.i = i;
            this.j = j;
            this.k = k;
            this.l = l;
            this.m = m;
            this.n = n;
            this.o = o;
            editorResolverService.registerEditor(`${gettingStartedInput_1.$MYb.RESOURCE.scheme}:/**`, {
                id: gettingStartedInput_1.$MYb.ID,
                label: (0, nls_1.localize)(0, null),
                priority: editorResolverService_1.RegisteredEditorPriority.builtin,
            }, {
                singlePerResource: false,
                canSupportResource: uri => uri.scheme === gettingStartedInput_1.$MYb.RESOURCE.scheme,
            }, {
                createEditorInput: ({ resource, options }) => {
                    return {
                        editor: this.a.createInstance(gettingStartedInput_1.$MYb, options),
                        options: {
                            ...options,
                            pinned: false
                        }
                    };
                }
            });
            this.p().then(undefined, errors_1.$Y);
        }
        async p() {
            // Always open Welcome page for first-launch, no matter what is open or which startupEditor is set.
            if (this.j.enableTelemetry
                && this.j.showTelemetryOptOut
                && (0, telemetryUtils_1.$jo)(this.b) !== 0 /* TelemetryLevel.NONE */
                && !this.l.skipWelcome
                && !this.m.get(telemetryOptOutStorageKey, 0 /* StorageScope.PROFILE */)) {
                this.m.store(telemetryOptOutStorageKey, true, 0 /* StorageScope.PROFILE */, 0 /* StorageTarget.USER */);
                await this.s(true);
                return;
            }
            if (this.q()) {
                return;
            }
            const enabled = isStartupPageEnabled(this.b, this.g, this.l);
            if (enabled && this.h.startupKind !== 3 /* StartupKind.ReloadedWindow */) {
                const hasBackups = await this.d.hasBackups();
                if (hasBackups) {
                    return;
                }
                // Open the welcome even if we opened a set of default editors
                if (!this.c.activeEditor || this.i.openedDefaultEditors) {
                    const startupEditorSetting = this.b.inspect(configurationKey);
                    const isStartupEditorReadme = startupEditorSetting.value === 'readme';
                    const isStartupEditorUserReadme = startupEditorSetting.userValue === 'readme';
                    const isStartupEditorDefaultReadme = startupEditorSetting.defaultValue === 'readme';
                    // 'readme' should not be set in workspace settings to prevent tracking,
                    // but it can be set as a default (as in codespaces or from configurationDefaults) or a user setting
                    if (isStartupEditorReadme && (!isStartupEditorUserReadme || !isStartupEditorDefaultReadme)) {
                        this.n.warn(`Warning: 'workbench.startupEditor: readme' setting ignored due to being set somewhere other than user or default settings (user=${startupEditorSetting.userValue}, default=${startupEditorSetting.defaultValue})`);
                    }
                    const openWithReadme = isStartupEditorReadme && (isStartupEditorUserReadme || isStartupEditorDefaultReadme);
                    if (openWithReadme) {
                        await this.r();
                    }
                    else if (startupEditorSetting.value === 'welcomePage' || startupEditorSetting.value === 'welcomePageInEmptyWorkbench') {
                        await this.s();
                    }
                }
            }
        }
        q() {
            const toRestore = this.m.get(exports.$OYb, 0 /* StorageScope.PROFILE */);
            if (!toRestore) {
                return false;
            }
            else {
                const restoreData = JSON.parse(toRestore);
                const currentWorkspace = this.g.getWorkspace();
                if (restoreData.folder === workspace_1.$Oh.id || restoreData.folder === currentWorkspace.folders[0].uri.toString()) {
                    this.c.openEditor({
                        resource: gettingStartedInput_1.$MYb.RESOURCE,
                        options: { selectedCategory: restoreData.category, selectedStep: restoreData.step, pinned: false },
                    });
                    this.m.remove(exports.$OYb, 0 /* StorageScope.PROFILE */);
                    return true;
                }
            }
            return false;
        }
        async r() {
            const readmes = arrays.$Fb(await Promise.all(this.g.getWorkspace().folders.map(async (folder) => {
                const folderUri = folder.uri;
                const folderStat = await this.f.resolve(folderUri).catch(errors_1.$Y);
                const files = folderStat?.children ? folderStat.children.map(child => child.name).sort() : [];
                const file = files.find(file => file.toLowerCase() === 'readme.md') || files.find(file => file.toLowerCase().startsWith('readme'));
                if (file) {
                    return (0, resources_1.$ig)(folderUri, file);
                }
                else {
                    return undefined;
                }
            })));
            if (!this.c.activeEditor) {
                if (readmes.length) {
                    const isMarkDown = (readme) => readme.path.toLowerCase().endsWith('.md');
                    await Promise.all([
                        this.k.executeCommand('markdown.showPreview', null, readmes.filter(isMarkDown), { locked: true }).catch(error => {
                            this.o.error((0, nls_1.localize)(1, null, error.message));
                        }),
                        this.c.openEditors(readmes.filter(readme => !isMarkDown(readme)).map(readme => ({ resource: readme }))),
                    ]);
                }
                else {
                    // If no readme is found, default to showing the welcome page.
                    await this.s();
                }
            }
        }
        async s(showTelemetryNotice) {
            const startupEditorTypeID = gettingStartedInput_1.$LYb;
            const editor = this.c.activeEditor;
            // Ensure that the welcome editor won't get opened more than once
            if (editor?.typeId === startupEditorTypeID || this.c.editors.some(e => e.typeId === startupEditorTypeID)) {
                return;
            }
            const options = editor ? { pinned: false, index: 0 } : { pinned: false };
            if (startupEditorTypeID === gettingStartedInput_1.$LYb) {
                this.c.openEditor({
                    resource: gettingStartedInput_1.$MYb.RESOURCE,
                    options: { showTelemetryNotice, ...options },
                });
            }
        }
    };
    exports.$PYb = $PYb;
    exports.$PYb = $PYb = __decorate([
        __param(0, instantiation_1.$Ah),
        __param(1, configuration_1.$8h),
        __param(2, editorService_1.$9C),
        __param(3, workingCopyBackup_1.$EA),
        __param(4, files_1.$6j),
        __param(5, workspace_1.$Kh),
        __param(6, lifecycle_1.$7y),
        __param(7, layoutService_1.$Meb),
        __param(8, productService_1.$kj),
        __param(9, commands_1.$Fr),
        __param(10, environmentService_1.$hJ),
        __param(11, storage_1.$Vo),
        __param(12, log_1.$5i),
        __param(13, notification_1.$Yu),
        __param(14, editorResolverService_1.$pbb)
    ], $PYb);
    function isStartupPageEnabled(configurationService, contextService, environmentService) {
        if (environmentService.skipWelcome) {
            return false;
        }
        const startupEditor = configurationService.inspect(configurationKey);
        if (!startupEditor.userValue && !startupEditor.workspaceValue) {
            const welcomeEnabled = configurationService.inspect(oldConfigurationKey);
            if (welcomeEnabled.value !== undefined && welcomeEnabled.value !== null) {
                return welcomeEnabled.value;
            }
        }
        return startupEditor.value === 'welcomePage'
            || startupEditor.value === 'readme' && (startupEditor.userValue === 'readme' || startupEditor.defaultValue === 'readme')
            || (contextService.getWorkbenchState() === 1 /* WorkbenchState.EMPTY */ && startupEditor.value === 'welcomePageInEmptyWorkbench');
    }
});
//# sourceMappingURL=startupPage.js.map