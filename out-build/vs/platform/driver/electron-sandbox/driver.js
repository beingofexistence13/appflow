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
define(["require", "exports", "vs/platform/driver/browser/driver", "vs/platform/environment/common/environment", "vs/platform/files/common/files"], function (require, exports, driver_1, environment_1, files_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$s$b = void 0;
    let NativeWindowDriver = class NativeWindowDriver extends driver_1.$E2b {
        constructor(f, fileService, environmentService) {
            super(fileService, environmentService);
            this.f = f;
        }
        exitApplication() {
            return this.f.exitApplication();
        }
    };
    NativeWindowDriver = __decorate([
        __param(1, files_1.$6j),
        __param(2, environment_1.$Ih)
    ], NativeWindowDriver);
    function $s$b(instantiationService, helper) {
        Object.assign(window, { driver: instantiationService.createInstance(NativeWindowDriver, helper) });
    }
    exports.$s$b = $s$b;
});
//# sourceMappingURL=driver.js.map