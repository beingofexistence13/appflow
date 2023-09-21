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
define(["require", "exports", "vs/platform/product/common/productService", "vs/base/common/actions", "vs/base/common/uri", "vs/platform/instantiation/common/instantiation", "vs/nls!vs/workbench/contrib/extensions/electron-sandbox/extensionsSlowActions", "vs/base/common/cancellation", "vs/platform/request/common/request", "vs/base/common/resources", "vs/platform/dialogs/common/dialogs", "vs/platform/opener/common/opener", "vs/platform/native/common/native", "vs/workbench/services/environment/electron-sandbox/environmentService", "vs/platform/profiling/common/profiling", "vs/platform/files/common/files", "vs/base/common/buffer"], function (require, exports, productService_1, actions_1, uri_1, instantiation_1, nls_1, cancellation_1, request_1, resources_1, dialogs_1, opener_1, native_1, environmentService_1, profiling_1, files_1, buffer_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$jac = exports.$iac = void 0;
    class RepoInfo {
        static fromExtension(desc) {
            let result;
            // scheme:auth/OWNER/REPO/issues/
            if (desc.bugs && typeof desc.bugs.url === 'string') {
                const base = uri_1.URI.parse(desc.bugs.url);
                const match = /\/([^/]+)\/([^/]+)\/issues\/?$/.exec(desc.bugs.url);
                if (match) {
                    result = {
                        base: base.with({ path: null, fragment: null, query: null }).toString(true),
                        owner: match[1],
                        repo: match[2]
                    };
                }
            }
            // scheme:auth/OWNER/REPO.git
            if (!result && desc.repository && typeof desc.repository.url === 'string') {
                const base = uri_1.URI.parse(desc.repository.url);
                const match = /\/([^/]+)\/([^/]+)(\.git)?$/.exec(desc.repository.url);
                if (match) {
                    result = {
                        base: base.with({ path: null, fragment: null, query: null }).toString(true),
                        owner: match[1],
                        repo: match[2]
                    };
                }
            }
            // for now only GH is supported
            if (result && result.base.indexOf('github') === -1) {
                result = undefined;
            }
            return result;
        }
    }
    let $iac = class $iac extends actions_1.$gi {
        constructor(extension, profile, a) {
            super('report.slow', (0, nls_1.localize)(0, null), 'extension-action report-issue');
            this.extension = extension;
            this.profile = profile;
            this.a = a;
            this.enabled = Boolean(RepoInfo.fromExtension(extension));
        }
        async run() {
            const action = await this.a.invokeFunction($jac, this.extension, this.profile);
            if (action) {
                await action.run();
            }
        }
    };
    exports.$iac = $iac;
    exports.$iac = $iac = __decorate([
        __param(2, instantiation_1.$Ah)
    ], $iac);
    async function $jac(accessor, extension, profile) {
        const info = RepoInfo.fromExtension(extension);
        if (!info) {
            return undefined;
        }
        const requestService = accessor.get(request_1.$Io);
        const instaService = accessor.get(instantiation_1.$Ah);
        const url = `https://api.github.com/search/issues?q=is:issue+state:open+in:title+repo:${info.owner}/${info.repo}+%22Extension+causes+high+cpu+load%22`;
        let res;
        try {
            res = await requestService.request({ url }, cancellation_1.CancellationToken.None);
        }
        catch {
            return undefined;
        }
        const rawText = await (0, request_1.$Mo)(res);
        if (!rawText) {
            return undefined;
        }
        const data = JSON.parse(rawText);
        if (!data || typeof data.total_count !== 'number') {
            return undefined;
        }
        else if (data.total_count === 0) {
            return instaService.createInstance(ReportExtensionSlowAction, extension, info, profile);
        }
        else {
            return instaService.createInstance(ShowExtensionSlowAction, extension, info, profile);
        }
    }
    exports.$jac = $jac;
    let ReportExtensionSlowAction = class ReportExtensionSlowAction extends actions_1.$gi {
        constructor(extension, repoInfo, profile, a, b, c, f, g, r) {
            super('report.slow', (0, nls_1.localize)(1, null));
            this.extension = extension;
            this.repoInfo = repoInfo;
            this.profile = profile;
            this.a = a;
            this.b = b;
            this.c = c;
            this.f = f;
            this.g = g;
            this.r = r;
        }
        async run() {
            // rewrite pii (paths) and store on disk
            const data = profiling_1.Utils.rewriteAbsolutePaths(this.profile.data, 'pii_removed');
            const path = (0, resources_1.$ig)(this.g.tmpDir, `${this.extension.identifier.value}-unresponsive.cpuprofile.txt`);
            await this.r.writeFile(path, buffer_1.$Fd.fromString(JSON.stringify(data, undefined, 4)));
            // build issue
            const os = await this.f.getOSProperties();
            const title = encodeURIComponent('Extension causes high cpu load');
            const osVersion = `${os.type} ${os.arch} ${os.release}`;
            const message = `:warning: Make sure to **attach** this file from your *home*-directory:\n:warning:\`${path}\`\n\nFind more details here: https://github.com/microsoft/vscode/wiki/Explain-extension-causes-high-cpu-load`;
            const body = encodeURIComponent(`- Issue Type: \`Performance\`
- Extension Name: \`${this.extension.name}\`
- Extension Version: \`${this.extension.version}\`
- OS Version: \`${osVersion}\`
- VS Code version: \`${this.c.version}\`\n\n${message}`);
            const url = `${this.repoInfo.base}/${this.repoInfo.owner}/${this.repoInfo.repo}/issues/new/?body=${body}&title=${title}`;
            this.b.open(uri_1.URI.parse(url));
            this.a.info((0, nls_1.localize)(2, null), (0, nls_1.localize)(3, null, path.fsPath));
        }
    };
    ReportExtensionSlowAction = __decorate([
        __param(3, dialogs_1.$oA),
        __param(4, opener_1.$NT),
        __param(5, productService_1.$kj),
        __param(6, native_1.$05b),
        __param(7, environmentService_1.$1$b),
        __param(8, files_1.$6j)
    ], ReportExtensionSlowAction);
    let ShowExtensionSlowAction = class ShowExtensionSlowAction extends actions_1.$gi {
        constructor(extension, repoInfo, profile, a, b, c, f) {
            super('show.slow', (0, nls_1.localize)(4, null));
            this.extension = extension;
            this.repoInfo = repoInfo;
            this.profile = profile;
            this.a = a;
            this.b = b;
            this.c = c;
            this.f = f;
        }
        async run() {
            // rewrite pii (paths) and store on disk
            const data = profiling_1.Utils.rewriteAbsolutePaths(this.profile.data, 'pii_removed');
            const path = (0, resources_1.$ig)(this.c.tmpDir, `${this.extension.identifier.value}-unresponsive.cpuprofile.txt`);
            await this.f.writeFile(path, buffer_1.$Fd.fromString(JSON.stringify(data, undefined, 4)));
            // show issues
            const url = `${this.repoInfo.base}/${this.repoInfo.owner}/${this.repoInfo.repo}/issues?utf8=✓&q=is%3Aissue+state%3Aopen+%22Extension+causes+high+cpu+load%22`;
            this.b.open(uri_1.URI.parse(url));
            this.a.info((0, nls_1.localize)(5, null), (0, nls_1.localize)(6, null, path.fsPath));
        }
    };
    ShowExtensionSlowAction = __decorate([
        __param(3, dialogs_1.$oA),
        __param(4, opener_1.$NT),
        __param(5, environmentService_1.$1$b),
        __param(6, files_1.$6j)
    ], ShowExtensionSlowAction);
});
//# sourceMappingURL=extensionsSlowActions.js.map