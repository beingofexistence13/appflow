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
define(["require", "exports", "vs/base/browser/hash", "vs/base/common/errors", "vs/platform/files/common/files", "vs/platform/telemetry/common/telemetry", "vs/platform/workspace/common/workspace", "vs/workbench/services/textfile/common/textfiles", "vs/workbench/contrib/tags/common/workspaceTags", "vs/platform/diagnostics/common/diagnostics", "vs/platform/request/common/request", "vs/base/common/platform", "vs/platform/extensionManagement/common/configRemotes", "vs/platform/native/common/native", "vs/platform/product/common/productService"], function (require, exports, hash_1, errors_1, files_1, telemetry_1, workspace_1, textfiles_1, workspaceTags_1, diagnostics_1, request_1, platform_1, configRemotes_1, native_1, productService_1) {
    "use strict";
    var $Gac_1;
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$Gac = exports.$Fac = void 0;
    async function $Fac(text, stripEndingDotGit = false) {
        return (0, workspaceTags_1.$OZb)(text, stripEndingDotGit, remote => (0, hash_1.$1Q)(remote));
    }
    exports.$Fac = $Fac;
    let $Gac = $Gac_1 = class $Gac {
        constructor(a, b, d, e, f, g, h, i, j) {
            this.a = a;
            this.b = b;
            this.d = d;
            this.e = e;
            this.f = f;
            this.g = g;
            this.h = h;
            this.i = i;
            this.j = j;
            if (this.d.telemetryLevel === 3 /* TelemetryLevel.USAGE */) {
                this.k();
            }
        }
        async k() {
            // Windows-only Edition Event
            this.l();
            // Workspace Tags
            this.g.getTags()
                .then(tags => this.n(tags), error => (0, errors_1.$Y)(error));
            // Cloud Stats
            this.u();
            this.w();
            this.m().then(stats => this.h.reportWorkspaceStats(stats));
        }
        async l() {
            if (!platform_1.$i) {
                return;
            }
            let value = await this.j.windowsGetStringRegKey('HKEY_LOCAL_MACHINE', 'SOFTWARE\\Microsoft\\Windows NT\\CurrentVersion', 'EditionID');
            if (value === undefined) {
                value = 'Unknown';
            }
            this.d.publicLog2('windowsEdition', { edition: value });
        }
        async m() {
            const workspace = this.b.getWorkspace();
            const state = this.b.getWorkbenchState();
            const telemetryId = await this.g.getTelemetryWorkspaceId(workspace, state);
            return {
                id: workspace.id,
                telemetryId,
                rendererSessionId: this.d.sessionId,
                folders: workspace.folders,
                transient: workspace.transient,
                configuration: workspace.configuration
            };
        }
        n(tags) {
            /* __GDPR__
                "workspce.tags" : {
                    "owner": "lramos15",
                    "${include}": [
                        "${WorkspaceTags}"
                    ]
                }
            */
            this.d.publicLog('workspce.tags', tags);
        }
        o(workspaceUris) {
            Promise.all(workspaceUris.map(workspaceUri => {
                const path = workspaceUri.path;
                const uri = workspaceUri.with({ path: `${path !== '/' ? path : ''}/.git/config` });
                return this.a.exists(uri).then(exists => {
                    if (!exists) {
                        return [];
                    }
                    return this.f.read(uri, { acceptTextOnly: true }).then(content => (0, configRemotes_1.$LZb)(content.value, configRemotes_1.$KZb), err => [] // ignore missing or binary file
                    );
                });
            })).then(domains => {
                const set = domains.reduce((set, list) => list.reduce((set, item) => set.add(item), set), new Set());
                const list = [];
                set.forEach(item => list.push(item));
                /* __GDPR__
                    "workspace.remotes" : {
                        "owner": "lramos15",
                        "domains" : { "classification": "SystemMetaData", "purpose": "FeatureInsight" }
                    }
                */
                this.d.publicLog('workspace.remotes', { domains: list.sort() });
            }, errors_1.$Y);
        }
        p(workspaceUris) {
            Promise.all(workspaceUris.map(workspaceUri => {
                return this.g.getHashedRemotesFromUri(workspaceUri, true);
            })).then(() => { }, errors_1.$Y);
        }
        /* __GDPR__FRAGMENT__
            "AzureTags" : {
                "node" : { "classification": "SystemMetaData", "purpose": "FeatureInsight", "isMeasurement": true }
            }
        */
        q(workspaceUris, tags) {
            // TODO: should also work for `node_modules` folders several levels down
            const uris = workspaceUris.map(workspaceUri => {
                const path = workspaceUri.path;
                return workspaceUri.with({ path: `${path !== '/' ? path : ''}/node_modules` });
            });
            return this.a.resolveAll(uris.map(resource => ({ resource }))).then(results => {
                const names = [].concat(...results.map(result => result.success ? (result.stat.children || []) : [])).map(c => c.name);
                const referencesAzure = $Gac_1.r(names, /azure/i);
                if (referencesAzure) {
                    tags['node'] = true;
                }
                return tags;
            }, err => {
                return tags;
            });
        }
        static r(arr, regEx) {
            return arr.some(v => v.search(regEx) > -1) || undefined;
        }
        /* __GDPR__FRAGMENT__
            "AzureTags" : {
                "java" : { "classification": "SystemMetaData", "purpose": "FeatureInsight", "isMeasurement": true }
            }
        */
        s(workspaceUris, tags) {
            return Promise.all(workspaceUris.map(workspaceUri => {
                const path = workspaceUri.path;
                const uri = workspaceUri.with({ path: `${path !== '/' ? path : ''}/pom.xml` });
                return this.a.exists(uri).then(exists => {
                    if (!exists) {
                        return false;
                    }
                    return this.f.read(uri, { acceptTextOnly: true }).then(content => !!content.value.match(/azure/i), err => false);
                });
            })).then(javas => {
                if (javas.indexOf(true) !== -1) {
                    tags['java'] = true;
                }
                return tags;
            });
        }
        t(uris) {
            const tags = Object.create(null);
            this.q(uris, tags).then((tags) => {
                return this.s(uris, tags);
            }).then((tags) => {
                if (Object.keys(tags).length) {
                    /* __GDPR__
                        "workspace.azure" : {
                            "owner": "lramos15",
                            "${include}": [
                                "${AzureTags}"
                            ]
                        }
                    */
                    this.d.publicLog('workspace.azure', tags);
                }
            }).then(undefined, errors_1.$Y);
        }
        u() {
            const uris = this.b.getWorkspace().folders.map(folder => folder.uri);
            if (uris.length && this.a) {
                this.o(uris);
                this.p(uris);
                this.t(uris);
            }
        }
        w() {
            const downloadUrl = this.i.downloadUrl;
            if (!downloadUrl) {
                return;
            }
            this.e.resolveProxy(downloadUrl)
                .then(proxy => {
                let type = proxy ? String(proxy).trim().split(/\s+/, 1)[0] : 'EMPTY';
                if (['DIRECT', 'PROXY', 'HTTPS', 'SOCKS', 'EMPTY'].indexOf(type) === -1) {
                    type = 'UNKNOWN';
                }
            }).then(undefined, errors_1.$Y);
        }
    };
    exports.$Gac = $Gac;
    exports.$Gac = $Gac = $Gac_1 = __decorate([
        __param(0, files_1.$6j),
        __param(1, workspace_1.$Kh),
        __param(2, telemetry_1.$9k),
        __param(3, request_1.$Io),
        __param(4, textfiles_1.$JD),
        __param(5, workspaceTags_1.$NZb),
        __param(6, diagnostics_1.$gm),
        __param(7, productService_1.$kj),
        __param(8, native_1.$05b)
    ], $Gac);
});
//# sourceMappingURL=workspaceTags.js.map