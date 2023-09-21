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
define(["require", "exports", "vs/base/common/lifecycle", "vs/workbench/common/contributions", "vs/platform/registry/common/platform", "vs/workbench/services/host/browser/host", "vs/platform/configuration/common/configuration", "vs/nls!vs/workbench/contrib/relauncher/browser/relauncher.contribution", "vs/platform/workspace/common/workspace", "vs/workbench/services/extensions/common/extensions", "vs/base/common/async", "vs/base/common/resources", "vs/base/common/platform", "vs/platform/dialogs/common/dialogs", "vs/workbench/services/environment/common/environmentService", "vs/platform/product/common/productService"], function (require, exports, lifecycle_1, contributions_1, platform_1, host_1, configuration_1, nls_1, workspace_1, extensions_1, async_1, resources_1, platform_2, dialogs_1, environmentService_1, productService_1) {
    "use strict";
    var $mXb_1;
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$nXb = exports.$mXb = void 0;
    let $mXb = class $mXb extends lifecycle_1.$kc {
        static { $mXb_1 = this; }
        static { this.a = [
            'window.titleBarStyle',
            'window.nativeTabs',
            'window.nativeFullScreen',
            'window.clickThroughInactive',
            'update.mode',
            'editor.accessibilitySupport',
            'security.workspace.trust.enabled',
            'workbench.enableExperiments',
            '_extensionsGallery.enablePPE',
            'security.restrictUNCAccess'
        ]; }
        constructor(t, u, w, y) {
            super();
            this.t = t;
            this.u = u;
            this.w = w;
            this.y = y;
            this.b = new ChangeObserver('string');
            this.c = new ChangeObserver('boolean');
            this.f = new ChangeObserver('boolean');
            this.g = new ChangeObserver('boolean');
            this.h = new ChangeObserver('string');
            this.m = new ChangeObserver('boolean');
            this.n = new ChangeObserver('boolean');
            this.r = new ChangeObserver('boolean');
            this.s = new ChangeObserver('boolean');
            this.z(undefined);
            this.B(this.u.onDidChangeConfiguration(e => this.z(e)));
        }
        z(e) {
            if (e && !$mXb_1.a.some(key => e.affectsConfiguration(key))) {
                return;
            }
            let changed = false;
            function processChanged(didChange) {
                changed = changed || didChange;
            }
            const config = this.u.getValue();
            if (platform_2.$m) {
                // Titlebar style
                processChanged((config.window.titleBarStyle === 'native' || config.window.titleBarStyle === 'custom') && this.b.handleChange(config.window?.titleBarStyle));
                // macOS: Native tabs
                processChanged(platform_2.$j && this.c.handleChange(config.window?.nativeTabs));
                // macOS: Native fullscreen
                processChanged(platform_2.$j && this.f.handleChange(config.window?.nativeFullScreen));
                // macOS: Click through (accept first mouse)
                processChanged(platform_2.$j && this.g.handleChange(config.window?.clickThroughInactive));
                // Update mode
                processChanged(this.h.handleChange(config.update?.mode));
                // On linux turning on accessibility support will also pass this flag to the chrome renderer, thus a restart is required
                if (platform_2.$k && typeof config.editor?.accessibilitySupport === 'string' && config.editor.accessibilitySupport !== this.j) {
                    this.j = config.editor.accessibilitySupport;
                    if (this.j === 'on') {
                        changed = true;
                    }
                }
                // Workspace trust
                processChanged(this.m.handleChange(config?.security?.workspace?.trust?.enabled));
                // UNC host access restrictions
                processChanged(this.s.handleChange(config?.security?.restrictUNCAccess));
            }
            // Experiments
            processChanged(this.n.handleChange(config.workbench?.enableExperiments));
            // Profiles
            processChanged(this.w.quality !== 'stable' && this.r.handleChange(config._extensionsGallery?.enablePPE));
            // Notify only when changed from an event and the change
            // was not triggerd programmatically (e.g. from experiments)
            if (changed && e && e.source !== 7 /* ConfigurationTarget.DEFAULT */) {
                this.C(platform_2.$m ?
                    (0, nls_1.localize)(0, null) :
                    (0, nls_1.localize)(1, null), platform_2.$m ?
                    (0, nls_1.localize)(2, null, this.w.nameLong) :
                    (0, nls_1.localize)(3, null, this.w.nameLong), platform_2.$m ?
                    (0, nls_1.localize)(4, null) :
                    (0, nls_1.localize)(5, null), () => this.t.restart());
            }
        }
        async C(message, detail, primaryButton, confirmedFn) {
            if (this.t.hasFocus) {
                const { confirmed } = await this.y.confirm({ message, detail, primaryButton });
                if (confirmed) {
                    confirmedFn();
                }
            }
        }
    };
    exports.$mXb = $mXb;
    exports.$mXb = $mXb = $mXb_1 = __decorate([
        __param(0, host_1.$VT),
        __param(1, configuration_1.$8h),
        __param(2, productService_1.$kj),
        __param(3, dialogs_1.$oA)
    ], $mXb);
    class ChangeObserver {
        static create(typeName) {
            return new ChangeObserver(typeName);
        }
        constructor(a) {
            this.a = a;
            this.b = undefined;
        }
        /**
         * Returns if there was a change compared to the last value
         */
        handleChange(value) {
            if (typeof value === this.a && value !== this.b) {
                this.b = value;
                return true;
            }
            return false;
        }
    }
    let $nXb = class $nXb extends lifecycle_1.$kc {
        constructor(f, extensionService, hostService, environmentService) {
            super();
            this.f = f;
            this.b = this.B(new async_1.$Sg(async () => {
                if (!!environmentService.extensionTestsLocationURI) {
                    return; // no restart when in tests: see https://github.com/microsoft/vscode/issues/66936
                }
                if (environmentService.remoteAuthority) {
                    hostService.reload(); // TODO@aeschli, workaround
                }
                else if (platform_2.$m) {
                    const stopped = await extensionService.stopExtensionHosts((0, nls_1.localize)(6, null));
                    if (stopped) {
                        extensionService.startExtensionHosts();
                    }
                }
            }, 10));
            this.f.getCompleteWorkspace()
                .then(workspace => {
                this.a = workspace.folders.length > 0 ? workspace.folders[0].uri : undefined;
                this.g();
                this.B(this.f.onDidChangeWorkbenchState(() => setTimeout(() => this.g())));
            });
            this.B((0, lifecycle_1.$ic)(() => {
                this.c?.dispose();
            }));
        }
        g() {
            // React to folder changes when we are in workspace state
            if (this.f.getWorkbenchState() === 3 /* WorkbenchState.WORKSPACE */) {
                // Update our known first folder path if we entered workspace
                const workspace = this.f.getWorkspace();
                this.a = workspace.folders.length > 0 ? workspace.folders[0].uri : undefined;
                // Install workspace folder listener
                if (!this.c) {
                    this.c = this.f.onDidChangeWorkspaceFolders(() => this.h());
                }
            }
            // Ignore the workspace folder changes in EMPTY or FOLDER state
            else {
                (0, lifecycle_1.$fc)(this.c);
                this.c = undefined;
            }
        }
        h() {
            const workspace = this.f.getWorkspace();
            // Restart extension host if first root folder changed (impact on deprecated workspace.rootPath API)
            const newFirstFolderResource = workspace.folders.length > 0 ? workspace.folders[0].uri : undefined;
            if (!(0, resources_1.$bg)(this.a, newFirstFolderResource)) {
                this.a = newFirstFolderResource;
                this.b.schedule(); // buffer calls to extension host restart
            }
        }
    };
    exports.$nXb = $nXb;
    exports.$nXb = $nXb = __decorate([
        __param(0, workspace_1.$Kh),
        __param(1, extensions_1.$MF),
        __param(2, host_1.$VT),
        __param(3, environmentService_1.$hJ)
    ], $nXb);
    const workbenchRegistry = platform_1.$8m.as(contributions_1.Extensions.Workbench);
    workbenchRegistry.registerWorkbenchContribution($mXb, 3 /* LifecyclePhase.Restored */);
    workbenchRegistry.registerWorkbenchContribution($nXb, 3 /* LifecyclePhase.Restored */);
});
//# sourceMappingURL=relauncher.contribution.js.map