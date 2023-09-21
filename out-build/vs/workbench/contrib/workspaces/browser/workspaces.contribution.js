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
define(["require", "exports", "vs/nls!vs/workbench/contrib/workspaces/browser/workspaces.contribution", "vs/platform/registry/common/platform", "vs/workbench/common/contributions", "vs/platform/workspace/common/workspace", "vs/base/common/lifecycle", "vs/platform/files/common/files", "vs/platform/notification/common/notification", "vs/base/common/resources", "vs/workbench/services/host/browser/host", "vs/platform/quickinput/common/quickInput", "vs/platform/storage/common/storage", "vs/platform/workspace/common/virtualWorkspace", "vs/platform/actions/common/actions", "vs/workbench/common/contextkeys", "vs/platform/contextkey/common/contextkey", "vs/workbench/contrib/files/common/files"], function (require, exports, nls_1, platform_1, contributions_1, workspace_1, lifecycle_1, files_1, notification_1, resources_1, host_1, quickInput_1, storage_1, virtualWorkspace_1, actions_1, contextkeys_1, contextkey_1, files_2) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$N1b = void 0;
    /**
     * A workbench contribution that will look for `.code-workspace` files in the root of the
     * workspace folder and open a notification to suggest to open one of the workspaces.
     */
    let $N1b = class $N1b extends lifecycle_1.$kc {
        constructor(a, b, c, f, g, h) {
            super();
            this.a = a;
            this.b = b;
            this.c = c;
            this.f = f;
            this.g = g;
            this.h = h;
            this.j();
        }
        async j() {
            const folder = this.a.getWorkspace().folders[0];
            if (!folder || this.a.getWorkbenchState() !== 2 /* WorkbenchState.FOLDER */ || (0, virtualWorkspace_1.$xJ)(this.a.getWorkspace())) {
                return; // require a single (non virtual) root folder
            }
            const rootFileNames = (await this.c.resolve(folder.uri)).children?.map(child => child.name);
            if (Array.isArray(rootFileNames)) {
                const workspaceFiles = rootFileNames.filter(workspace_1.$7h);
                if (workspaceFiles.length > 0) {
                    this.m(folder.uri, workspaceFiles);
                }
            }
        }
        m(folder, workspaces) {
            const neverShowAgain = { id: 'workspaces.dontPromptToOpen', scope: notification_1.NeverShowAgainScope.WORKSPACE, isSecondary: true };
            // Prompt to open one workspace
            if (workspaces.length === 1) {
                const workspaceFile = workspaces[0];
                this.b.prompt(notification_1.Severity.Info, (0, nls_1.localize)(0, null, workspaceFile, 'https://go.microsoft.com/fwlink/?linkid=2025315'), [{
                        label: (0, nls_1.localize)(1, null),
                        run: () => this.g.openWindow([{ workspaceUri: (0, resources_1.$ig)(folder, workspaceFile) }])
                    }], {
                    neverShowAgain,
                    priority: !this.h.isNew(1 /* StorageScope.WORKSPACE */) ? notification_1.NotificationPriority.SILENT : undefined // https://github.com/microsoft/vscode/issues/125315
                });
            }
            // Prompt to select a workspace from many
            else if (workspaces.length > 1) {
                this.b.prompt(notification_1.Severity.Info, (0, nls_1.localize)(2, null, 'https://go.microsoft.com/fwlink/?linkid=2025315'), [{
                        label: (0, nls_1.localize)(3, null),
                        run: () => {
                            this.f.pick(workspaces.map(workspace => ({ label: workspace })), { placeHolder: (0, nls_1.localize)(4, null) }).then(pick => {
                                if (pick) {
                                    this.g.openWindow([{ workspaceUri: (0, resources_1.$ig)(folder, pick.label) }]);
                                }
                            });
                        }
                    }], {
                    neverShowAgain,
                    priority: !this.h.isNew(1 /* StorageScope.WORKSPACE */) ? notification_1.NotificationPriority.SILENT : undefined // https://github.com/microsoft/vscode/issues/125315
                });
            }
        }
    };
    exports.$N1b = $N1b;
    exports.$N1b = $N1b = __decorate([
        __param(0, workspace_1.$Kh),
        __param(1, notification_1.$Yu),
        __param(2, files_1.$6j),
        __param(3, quickInput_1.$Gq),
        __param(4, host_1.$VT),
        __param(5, storage_1.$Vo)
    ], $N1b);
    platform_1.$8m.as(contributions_1.Extensions.Workbench).registerWorkbenchContribution($N1b, 4 /* LifecyclePhase.Eventually */);
    // Render "Open Workspace" button in *.code-workspace files
    (0, actions_1.$Xu)(class extends actions_1.$Wu {
        constructor() {
            super({
                id: 'workbench.action.openWorkspaceFromEditor',
                title: { original: 'Open Workspace', value: (0, nls_1.localize)(5, null) },
                f1: false,
                menu: {
                    id: actions_1.$Ru.EditorContent,
                    when: contextkey_1.$Ii.and(contextkeys_1.$Kdb.Extension.isEqualTo(workspace_1.$Yh), contextkeys_1.$$cb.isEqualTo(files_2.$7db), contextkeys_1.$Xcb.toNegated())
                }
            });
        }
        async run(accessor, uri) {
            const hostService = accessor.get(host_1.$VT);
            const contextService = accessor.get(workspace_1.$Kh);
            const notificationService = accessor.get(notification_1.$Yu);
            if (contextService.getWorkbenchState() === 3 /* WorkbenchState.WORKSPACE */) {
                const workspaceConfiguration = contextService.getWorkspace().configuration;
                if (workspaceConfiguration && (0, resources_1.$bg)(workspaceConfiguration, uri)) {
                    notificationService.info((0, nls_1.localize)(6, null));
                    return; // workspace already opened
                }
            }
            return hostService.openWindow([{ workspaceUri: uri }]);
        }
    });
});
//# sourceMappingURL=workspaces.contribution.js.map