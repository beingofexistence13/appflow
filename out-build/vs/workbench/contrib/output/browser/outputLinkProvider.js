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
define(["require", "exports", "vs/base/common/async", "vs/editor/common/services/model", "vs/platform/workspace/common/workspace", "vs/workbench/services/output/common/output", "vs/editor/browser/services/webWorker", "vs/base/common/lifecycle", "vs/editor/common/languages/languageConfigurationRegistry", "vs/editor/common/services/languageFeatures"], function (require, exports, async_1, model_1, workspace_1, output_1, webWorker_1, lifecycle_1, languageConfigurationRegistry_1, languageFeatures_1) {
    "use strict";
    var $jVb_1;
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$jVb = void 0;
    let $jVb = class $jVb {
        static { $jVb_1 = this; }
        static { this.a = 3 * 60 * 1000; } // dispose worker after 3 minutes of inactivity
        constructor(e, f, g, h) {
            this.e = e;
            this.f = f;
            this.g = g;
            this.h = h;
            this.c = new async_1.$Sg(() => this.m(), $jVb_1.a);
            this.i();
            this.j();
        }
        i() {
            this.e.onDidChangeWorkspaceFolders(() => this.j());
        }
        j() {
            // Setup link provider depending on folders being opened or not
            const folders = this.e.getWorkspace().folders;
            if (folders.length > 0) {
                if (!this.d) {
                    this.d = this.h.linkProvider.register([{ language: output_1.$9I, scheme: '*' }, { language: output_1.$_I, scheme: '*' }], {
                        provideLinks: async (model) => {
                            const links = await this.l(model.uri);
                            return links && { links };
                        }
                    });
                }
            }
            else {
                (0, lifecycle_1.$fc)(this.d);
                this.d = undefined;
            }
            // Dispose worker to recreate with folders on next provideLinks request
            this.m();
            this.c.cancel();
        }
        k() {
            this.c.schedule();
            if (!this.b) {
                const createData = {
                    workspaceFolders: this.e.getWorkspace().folders.map(folder => folder.uri.toString())
                };
                this.b = (0, webWorker_1.$tBb)(this.f, this.g, {
                    moduleId: 'vs/workbench/contrib/output/common/outputLinkComputer',
                    createData,
                    label: 'outputLinkComputer'
                });
            }
            return this.b;
        }
        async l(modelUri) {
            const linkComputer = await this.k().withSyncedResources([modelUri]);
            return linkComputer.computeLinks(modelUri.toString());
        }
        m() {
            if (this.b) {
                this.b.dispose();
                this.b = undefined;
            }
        }
    };
    exports.$jVb = $jVb;
    exports.$jVb = $jVb = $jVb_1 = __decorate([
        __param(0, workspace_1.$Kh),
        __param(1, model_1.$yA),
        __param(2, languageConfigurationRegistry_1.$2t),
        __param(3, languageFeatures_1.$hF)
    ], $jVb);
});
//# sourceMappingURL=outputLinkProvider.js.map