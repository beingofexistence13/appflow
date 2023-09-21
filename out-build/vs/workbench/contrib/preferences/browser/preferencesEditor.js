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
define(["require", "exports", "vs/base/common/lifecycle", "vs/platform/instantiation/common/instantiation", "vs/platform/workspace/common/workspace", "vs/workbench/contrib/preferences/browser/preferencesRenderers", "vs/workbench/services/preferences/common/preferences", "vs/workbench/services/preferences/common/preferencesModels"], function (require, exports, lifecycle_1, instantiation_1, workspace_1, preferencesRenderers_1, preferences_1, preferencesModels_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$lDb = void 0;
    let $lDb = class $lDb extends lifecycle_1.$kc {
        static { this.ID = 'editor.contrib.settings'; }
        constructor(c, f, g, h) {
            super();
            this.c = c;
            this.f = f;
            this.g = g;
            this.h = h;
            this.b = this.B(new lifecycle_1.$jc());
            this.j();
            this.B(this.c.onDidChangeModel(e => this.j()));
            this.B(this.h.onDidChangeWorkbenchState(() => this.j()));
        }
        async j() {
            this.b.clear();
            this.a = undefined;
            const model = this.c.getModel();
            if (model && /\.(json|code-workspace)$/.test(model.uri.path)) {
                // Fast check: the preferences renderer can only appear
                // in settings files or workspace files
                const settingsModel = await this.g.createPreferencesEditorModel(model.uri);
                if (settingsModel instanceof preferencesModels_1.$sE && this.c.getModel()) {
                    this.b.add(settingsModel);
                    switch (settingsModel.configurationTarget) {
                        case 5 /* ConfigurationTarget.WORKSPACE */:
                            this.a = this.b.add(this.f.createInstance(preferencesRenderers_1.$kDb, this.c, settingsModel));
                            break;
                        default:
                            this.a = this.b.add(this.f.createInstance(preferencesRenderers_1.$jDb, this.c, settingsModel));
                            break;
                    }
                }
                this.a?.render();
            }
        }
    };
    exports.$lDb = $lDb;
    exports.$lDb = $lDb = __decorate([
        __param(1, instantiation_1.$Ah),
        __param(2, preferences_1.$BE),
        __param(3, workspace_1.$Kh)
    ], $lDb);
});
//# sourceMappingURL=preferencesEditor.js.map