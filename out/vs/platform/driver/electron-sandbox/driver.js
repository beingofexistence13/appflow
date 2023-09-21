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
    exports.registerWindowDriver = void 0;
    let NativeWindowDriver = class NativeWindowDriver extends driver_1.BrowserWindowDriver {
        constructor(helper, fileService, environmentService) {
            super(fileService, environmentService);
            this.helper = helper;
        }
        exitApplication() {
            return this.helper.exitApplication();
        }
    };
    NativeWindowDriver = __decorate([
        __param(1, files_1.IFileService),
        __param(2, environment_1.IEnvironmentService)
    ], NativeWindowDriver);
    function registerWindowDriver(instantiationService, helper) {
        Object.assign(window, { driver: instantiationService.createInstance(NativeWindowDriver, helper) });
    }
    exports.registerWindowDriver = registerWindowDriver;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZHJpdmVyLmpzIiwic291cmNlUm9vdCI6ImZpbGU6Ly8vd29ya3NwYWNlL2FwcGZsb3cvc3JjLyIsInNvdXJjZXMiOlsidnMvcGxhdGZvcm0vZHJpdmVyL2VsZWN0cm9uLXNhbmRib3gvZHJpdmVyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Z0dBR2dHOzs7Ozs7Ozs7Ozs7OztJQVdoRyxJQUFNLGtCQUFrQixHQUF4QixNQUFNLGtCQUFtQixTQUFRLDRCQUFtQjtRQUVuRCxZQUNrQixNQUFpQyxFQUNwQyxXQUF5QixFQUNsQixrQkFBdUM7WUFFNUQsS0FBSyxDQUFDLFdBQVcsRUFBRSxrQkFBa0IsQ0FBQyxDQUFDO1lBSnRCLFdBQU0sR0FBTixNQUFNLENBQTJCO1FBS25ELENBQUM7UUFFUSxlQUFlO1lBQ3ZCLE9BQU8sSUFBSSxDQUFDLE1BQU0sQ0FBQyxlQUFlLEVBQUUsQ0FBQztRQUN0QyxDQUFDO0tBQ0QsQ0FBQTtJQWJLLGtCQUFrQjtRQUlyQixXQUFBLG9CQUFZLENBQUE7UUFDWixXQUFBLGlDQUFtQixDQUFBO09BTGhCLGtCQUFrQixDQWF2QjtJQUVELFNBQWdCLG9CQUFvQixDQUFDLG9CQUEyQyxFQUFFLE1BQWlDO1FBQ2xILE1BQU0sQ0FBQyxNQUFNLENBQUMsTUFBTSxFQUFFLEVBQUUsTUFBTSxFQUFFLG9CQUFvQixDQUFDLGNBQWMsQ0FBQyxrQkFBa0IsRUFBRSxNQUFNLENBQUMsRUFBRSxDQUFDLENBQUM7SUFDcEcsQ0FBQztJQUZELG9EQUVDIn0=