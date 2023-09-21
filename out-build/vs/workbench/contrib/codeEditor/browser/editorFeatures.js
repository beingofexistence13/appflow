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
define(["require", "exports", "vs/base/common/errors", "vs/base/common/lifecycle", "vs/editor/browser/services/codeEditorService", "vs/editor/common/editorFeatures", "vs/platform/instantiation/common/instantiation", "vs/platform/registry/common/platform", "vs/workbench/common/contributions"], function (require, exports, errors_1, lifecycle_1, codeEditorService_1, editorFeatures_1, instantiation_1, platform_1, contributions_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    let EditorFeaturesInstantiator = class EditorFeaturesInstantiator extends lifecycle_1.$kc {
        constructor(codeEditorService, b) {
            super();
            this.b = b;
            this.a = false;
            this.B(codeEditorService.onWillCreateCodeEditor(() => this.c()));
            this.B(codeEditorService.onWillCreateDiffEditor(() => this.c()));
            if (codeEditorService.listCodeEditors().length > 0 || codeEditorService.listDiffEditors().length > 0) {
                this.c();
            }
        }
        c() {
            if (this.a) {
                return;
            }
            this.a = true;
            // Instantiate all editor features
            const editorFeatures = (0, editorFeatures_1.$_2)();
            for (const feature of editorFeatures) {
                try {
                    const instance = this.b.createInstance(feature);
                    if (typeof instance.dispose === 'function') {
                        this.B(instance);
                    }
                }
                catch (err) {
                    (0, errors_1.$Y)(err);
                }
            }
        }
    };
    EditorFeaturesInstantiator = __decorate([
        __param(0, codeEditorService_1.$nV),
        __param(1, instantiation_1.$Ah)
    ], EditorFeaturesInstantiator);
    const workbenchRegistry = platform_1.$8m.as(contributions_1.Extensions.Workbench);
    workbenchRegistry.registerWorkbenchContribution(EditorFeaturesInstantiator, 2 /* LifecyclePhase.Ready */);
});
//# sourceMappingURL=editorFeatures.js.map