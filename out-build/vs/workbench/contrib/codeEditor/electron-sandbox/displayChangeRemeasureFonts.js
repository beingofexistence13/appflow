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
define(["require", "exports", "vs/base/common/lifecycle", "vs/editor/browser/config/fontMeasurements", "vs/platform/native/common/native", "vs/platform/registry/common/platform", "vs/workbench/common/contributions"], function (require, exports, lifecycle_1, fontMeasurements_1, native_1, platform_1, contributions_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    let DisplayChangeRemeasureFonts = class DisplayChangeRemeasureFonts extends lifecycle_1.$kc {
        constructor(nativeHostService) {
            super();
            this.B(nativeHostService.onDidChangeDisplay(() => {
                fontMeasurements_1.$zU.clearAllFontInfos();
            }));
        }
    };
    DisplayChangeRemeasureFonts = __decorate([
        __param(0, native_1.$05b)
    ], DisplayChangeRemeasureFonts);
    platform_1.$8m.as(contributions_1.Extensions.Workbench).registerWorkbenchContribution(DisplayChangeRemeasureFonts, 4 /* LifecyclePhase.Eventually */);
});
//# sourceMappingURL=displayChangeRemeasureFonts.js.map