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
define(["require", "exports", "vs/platform/registry/common/platform", "vs/workbench/common/contributions", "vs/editor/browser/services/codeEditorService", "vs/platform/native/common/native", "vs/base/common/lifecycle"], function (require, exports, platform_1, contributions_1, codeEditorService_1, native_1, lifecycle_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    let SleepResumeRepaintMinimap = class SleepResumeRepaintMinimap extends lifecycle_1.$kc {
        constructor(codeEditorService, nativeHostService) {
            super();
            this.B(nativeHostService.onDidResumeOS(() => {
                codeEditorService.listCodeEditors().forEach(editor => editor.render(true));
            }));
        }
    };
    SleepResumeRepaintMinimap = __decorate([
        __param(0, codeEditorService_1.$nV),
        __param(1, native_1.$05b)
    ], SleepResumeRepaintMinimap);
    platform_1.$8m.as(contributions_1.Extensions.Workbench).registerWorkbenchContribution(SleepResumeRepaintMinimap, 4 /* LifecyclePhase.Eventually */);
});
//# sourceMappingURL=sleepResumeRepaintMinimap.js.map