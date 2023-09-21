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
define(["require", "exports", "vs/platform/instantiation/common/instantiation", "vs/platform/lifecycle/electron-main/lifecycleMainService", "vs/platform/log/common/log", "vs/platform/menubar/electron-main/menubar"], function (require, exports, instantiation_1, lifecycleMainService_1, log_1, menubar_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.MenubarMainService = exports.IMenubarMainService = void 0;
    exports.IMenubarMainService = (0, instantiation_1.createDecorator)('menubarMainService');
    let MenubarMainService = class MenubarMainService {
        constructor(instantiationService, lifecycleMainService, logService) {
            this.instantiationService = instantiationService;
            this.lifecycleMainService = lifecycleMainService;
            this.logService = logService;
            this.menubar = this.installMenuBarAfterWindowOpen();
        }
        async installMenuBarAfterWindowOpen() {
            await this.lifecycleMainService.when(3 /* LifecycleMainPhase.AfterWindowOpen */);
            return this.instantiationService.createInstance(menubar_1.Menubar);
        }
        async updateMenubar(windowId, menus) {
            this.logService.trace('menubarService#updateMenubar', windowId);
            const menubar = await this.menubar;
            menubar.updateMenu(menus, windowId);
        }
    };
    exports.MenubarMainService = MenubarMainService;
    exports.MenubarMainService = MenubarMainService = __decorate([
        __param(0, instantiation_1.IInstantiationService),
        __param(1, lifecycleMainService_1.ILifecycleMainService),
        __param(2, log_1.ILogService)
    ], MenubarMainService);
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWVudWJhck1haW5TZXJ2aWNlLmpzIiwic291cmNlUm9vdCI6ImZpbGU6Ly8vd29ya3NwYWNlL2FwcGZsb3cvc3JjLyIsInNvdXJjZXMiOlsidnMvcGxhdGZvcm0vbWVudWJhci9lbGVjdHJvbi1tYWluL21lbnViYXJNYWluU2VydmljZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O2dHQUdnRzs7Ozs7Ozs7Ozs7Ozs7SUFRbkYsUUFBQSxtQkFBbUIsR0FBRyxJQUFBLCtCQUFlLEVBQXNCLG9CQUFvQixDQUFDLENBQUM7SUFNdkYsSUFBTSxrQkFBa0IsR0FBeEIsTUFBTSxrQkFBa0I7UUFNOUIsWUFDeUMsb0JBQTJDLEVBQzNDLG9CQUEyQyxFQUNyRCxVQUF1QjtZQUZiLHlCQUFvQixHQUFwQixvQkFBb0IsQ0FBdUI7WUFDM0MseUJBQW9CLEdBQXBCLG9CQUFvQixDQUF1QjtZQUNyRCxlQUFVLEdBQVYsVUFBVSxDQUFhO1lBRXJELElBQUksQ0FBQyxPQUFPLEdBQUcsSUFBSSxDQUFDLDZCQUE2QixFQUFFLENBQUM7UUFDckQsQ0FBQztRQUVPLEtBQUssQ0FBQyw2QkFBNkI7WUFDMUMsTUFBTSxJQUFJLENBQUMsb0JBQW9CLENBQUMsSUFBSSw0Q0FBb0MsQ0FBQztZQUV6RSxPQUFPLElBQUksQ0FBQyxvQkFBb0IsQ0FBQyxjQUFjLENBQUMsaUJBQU8sQ0FBQyxDQUFDO1FBQzFELENBQUM7UUFFRCxLQUFLLENBQUMsYUFBYSxDQUFDLFFBQWdCLEVBQUUsS0FBbUI7WUFDeEQsSUFBSSxDQUFDLFVBQVUsQ0FBQyxLQUFLLENBQUMsOEJBQThCLEVBQUUsUUFBUSxDQUFDLENBQUM7WUFFaEUsTUFBTSxPQUFPLEdBQUcsTUFBTSxJQUFJLENBQUMsT0FBTyxDQUFDO1lBQ25DLE9BQU8sQ0FBQyxVQUFVLENBQUMsS0FBSyxFQUFFLFFBQVEsQ0FBQyxDQUFDO1FBQ3JDLENBQUM7S0FDRCxDQUFBO0lBMUJZLGdEQUFrQjtpQ0FBbEIsa0JBQWtCO1FBTzVCLFdBQUEscUNBQXFCLENBQUE7UUFDckIsV0FBQSw0Q0FBcUIsQ0FBQTtRQUNyQixXQUFBLGlCQUFXLENBQUE7T0FURCxrQkFBa0IsQ0EwQjlCIn0=