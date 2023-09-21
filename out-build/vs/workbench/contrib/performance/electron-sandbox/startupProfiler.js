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
define(["require", "exports", "vs/nls!vs/workbench/contrib/performance/electron-sandbox/startupProfiler", "vs/base/common/resources", "vs/editor/common/services/resolverService", "vs/platform/dialogs/common/dialogs", "vs/workbench/services/environment/electron-sandbox/environmentService", "vs/workbench/services/lifecycle/common/lifecycle", "vs/workbench/contrib/performance/browser/perfviewEditor", "vs/workbench/services/extensions/common/extensions", "vs/platform/clipboard/common/clipboardService", "vs/base/common/uri", "vs/platform/opener/common/opener", "vs/platform/native/common/native", "vs/platform/product/common/productService", "vs/platform/files/common/files", "vs/platform/label/common/label"], function (require, exports, nls_1, resources_1, resolverService_1, dialogs_1, environmentService_1, lifecycle_1, perfviewEditor_1, extensions_1, clipboardService_1, uri_1, opener_1, native_1, productService_1, files_1, label_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$Pac = void 0;
    let $Pac = class $Pac {
        constructor(a, b, c, d, lifecycleService, extensionService, e, f, g, h, i) {
            this.a = a;
            this.b = b;
            this.c = c;
            this.d = d;
            this.e = e;
            this.f = f;
            this.g = g;
            this.h = h;
            this.i = i;
            // wait for everything to be ready
            Promise.all([
                lifecycleService.when(4 /* LifecyclePhase.Eventually */),
                extensionService.whenInstalledExtensionsRegistered()
            ]).then(() => {
                this.j();
            });
        }
        j() {
            if (!this.b.args['prof-startup-prefix']) {
                return;
            }
            const profileFilenamePrefix = uri_1.URI.file(this.b.args['prof-startup-prefix']);
            const dir = (0, resources_1.$hg)(profileFilenamePrefix);
            const prefix = (0, resources_1.$fg)(profileFilenamePrefix);
            const removeArgs = ['--prof-startup'];
            const markerFile = this.h.readFile(profileFilenamePrefix).then(value => removeArgs.push(...value.toString().split('|')))
                .then(() => this.h.del(profileFilenamePrefix, { recursive: true })) // (1) delete the file to tell the main process to stop profiling
                .then(() => new Promise(resolve => {
                const check = () => {
                    this.h.exists(profileFilenamePrefix).then(exists => {
                        if (exists) {
                            resolve();
                        }
                        else {
                            setTimeout(check, 500);
                        }
                    });
                };
                check();
            }))
                .then(() => this.h.del(profileFilenamePrefix, { recursive: true })); // (3) finally delete the file again
            markerFile.then(() => {
                return this.h.resolve(dir).then(stat => {
                    return (stat.children ? stat.children.filter(value => value.resource.path.includes(prefix)) : []).map(stat => stat.resource);
                });
            }).then(files => {
                const profileFiles = files.reduce((prev, cur) => `${prev}${this.i.getUriLabel(cur)}\n`, '\n');
                return this.a.confirm({
                    type: 'info',
                    message: (0, nls_1.localize)(0, null),
                    detail: (0, nls_1.localize)(1, null, profileFiles),
                    primaryButton: (0, nls_1.localize)(2, null),
                    cancelButton: (0, nls_1.localize)(3, null)
                }).then(res => {
                    if (res.confirmed) {
                        Promise.all([
                            this.f.showItemInFolder(files[0].fsPath),
                            this.k(files.map(file => (0, resources_1.$fg)(file)))
                        ]).then(() => {
                            // keep window stable until restart is selected
                            return this.a.confirm({
                                type: 'info',
                                message: (0, nls_1.localize)(4, null),
                                detail: (0, nls_1.localize)(5, null, this.g.nameLong),
                                primaryButton: (0, nls_1.localize)(6, null)
                            }).then(res => {
                                // now we are ready to restart
                                if (res.confirmed) {
                                    this.f.relaunch({ removeArgs });
                                }
                            });
                        });
                    }
                    else {
                        // simply restart
                        this.f.relaunch({ removeArgs });
                    }
                });
            });
        }
        async k(files) {
            const reportIssueUrl = this.g.reportIssueUrl;
            if (!reportIssueUrl) {
                return;
            }
            const ref = await this.c.createModelReference(perfviewEditor_1.$hEb.Uri);
            try {
                await this.d.writeText(ref.object.textEditorModel.getValue());
            }
            finally {
                ref.dispose();
            }
            const body = `
1. :warning: We have copied additional data to your clipboard. Make sure to **paste** here. :warning:
1. :warning: Make sure to **attach** these files from your *home*-directory: :warning:\n${files.map(file => `-\`${file}\``).join('\n')}
`;
            const baseUrl = reportIssueUrl;
            const queryStringPrefix = baseUrl.indexOf('?') === -1 ? '?' : '&';
            this.e.open(uri_1.URI.parse(`${baseUrl}${queryStringPrefix}body=${encodeURIComponent(body)}`));
        }
    };
    exports.$Pac = $Pac;
    exports.$Pac = $Pac = __decorate([
        __param(0, dialogs_1.$oA),
        __param(1, environmentService_1.$1$b),
        __param(2, resolverService_1.$uA),
        __param(3, clipboardService_1.$UZ),
        __param(4, lifecycle_1.$7y),
        __param(5, extensions_1.$MF),
        __param(6, opener_1.$NT),
        __param(7, native_1.$05b),
        __param(8, productService_1.$kj),
        __param(9, files_1.$6j),
        __param(10, label_1.$Vz)
    ], $Pac);
});
//# sourceMappingURL=startupProfiler.js.map