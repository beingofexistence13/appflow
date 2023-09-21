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
define(["require", "exports", "vs/editor/browser/editorBrowser", "vs/workbench/services/lifecycle/common/lifecycle", "vs/platform/update/common/update", "vs/workbench/contrib/files/common/files", "vs/workbench/services/editor/common/editorService", "vs/platform/workspace/common/workspaceTrust", "vs/workbench/services/panecomposite/browser/panecomposite", "vs/platform/log/common/log", "vs/platform/product/common/productService", "vs/platform/telemetry/common/telemetry", "vs/workbench/services/environment/browser/environmentService", "vs/workbench/services/timer/browser/timerService", "vs/base/common/path", "vs/base/common/hash"], function (require, exports, editorBrowser_1, lifecycle_1, update_1, files, editorService_1, workspaceTrust_1, panecomposite_1, log_1, productService_1, telemetry_1, environmentService_1, timerService_1, path_1, hash_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$Y4b = exports.$X4b = exports.$W4b = void 0;
    let $W4b = class $W4b {
        constructor(a, b, c, d, e) {
            this.a = a;
            this.b = b;
            this.c = c;
            this.d = d;
            this.e = e;
        }
        async f() {
            // check for standard startup:
            // * new window (no reload)
            // * workspace is trusted
            // * just one window
            // * explorer viewlet visible
            // * one text editor (not multiple, not webview, welcome etc...)
            // * cached data present (not rejected, not created)
            if (this.c.startupKind !== 1 /* StartupKind.NewWindow */) {
                return (0, lifecycle_1.$8y)(this.c.startupKind);
            }
            if (!this.e.isWorkspaceTrusted()) {
                return 'Workspace not trusted';
            }
            const activeViewlet = this.b.getActivePaneComposite(0 /* ViewContainerLocation.Sidebar */);
            if (!activeViewlet || activeViewlet.getId() !== files.$Mdb) {
                return 'Explorer viewlet not visible';
            }
            const visibleEditorPanes = this.a.visibleEditorPanes;
            if (visibleEditorPanes.length !== 1) {
                return `Expected text editor count : 1, Actual : ${visibleEditorPanes.length}`;
            }
            if (!(0, editorBrowser_1.$iV)(visibleEditorPanes[0].getControl())) {
                return 'Active editor is not a text editor';
            }
            const activePanel = this.b.getActivePaneComposite(1 /* ViewContainerLocation.Panel */);
            if (activePanel) {
                return `Current active panel : ${this.b.getPaneComposite(activePanel.getId(), 1 /* ViewContainerLocation.Panel */)?.name}`;
            }
            const isLatestVersion = await this.d.isLatestVersion();
            if (isLatestVersion === false) {
                return 'Not on latest version, updates available';
            }
            return undefined;
        }
    };
    exports.$W4b = $W4b;
    exports.$W4b = $W4b = __decorate([
        __param(0, editorService_1.$9C),
        __param(1, panecomposite_1.$Yeb),
        __param(2, lifecycle_1.$7y),
        __param(3, update_1.$UT),
        __param(4, workspaceTrust_1.$$z)
    ], $W4b);
    let $X4b = class $X4b extends $W4b {
        constructor(editorService, paneCompositeService, lifecycleService, updateService, workspaceTrustService, g, h, i, j, k) {
            super(editorService, paneCompositeService, lifecycleService, updateService, workspaceTrustService);
            this.g = g;
            this.h = h;
            this.i = i;
            this.j = j;
            this.k = k;
            this.l();
        }
        async l() {
            if (!this.i.profDurationMarkers) {
                return;
            }
            await this.g.whenReady();
            const standardStartupError = await this.f();
            const perfBaseline = await this.g.perfBaseline;
            const [from, to] = this.i.profDurationMarkers;
            const content = `${this.g.getDuration(from, to)}\t${this.k.nameShort}\t${(this.k.commit || '').slice(0, 10) || '0000000000'}\t${this.j.sessionId}\t${standardStartupError === undefined ? 'standard_start' : 'NO_standard_start : ' + standardStartupError}\t${String(perfBaseline).padStart(4, '0')}ms\n`;
            this.h.info(`[prof-timers] ${content}`);
        }
    };
    exports.$X4b = $X4b;
    exports.$X4b = $X4b = __decorate([
        __param(0, editorService_1.$9C),
        __param(1, panecomposite_1.$Yeb),
        __param(2, lifecycle_1.$7y),
        __param(3, update_1.$UT),
        __param(4, workspaceTrust_1.$$z),
        __param(5, timerService_1.$kkb),
        __param(6, log_1.$5i),
        __param(7, environmentService_1.$LT),
        __param(8, telemetry_1.$9k),
        __param(9, productService_1.$kj)
    ], $X4b);
    let $Y4b = class $Y4b {
        constructor(telemetryService) {
            for (const item of performance.getEntriesByType('resource')) {
                try {
                    const url = new URL(item.name);
                    const name = path_1.$6d.basename(url.pathname);
                    telemetryService.publicLog2('startup.resource.perf', {
                        hosthash: `H${(0, hash_1.$pi)(url.host).toString(16)}`,
                        name,
                        duration: item.duration
                    });
                }
                catch {
                    // ignore
                }
            }
        }
    };
    exports.$Y4b = $Y4b;
    exports.$Y4b = $Y4b = __decorate([
        __param(0, telemetry_1.$9k)
    ], $Y4b);
});
//# sourceMappingURL=startupTimings.js.map