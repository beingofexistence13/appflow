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
define(["require", "exports", "vs/base/common/lifecycle", "vs/platform/languagePacks/common/languagePacks"], function (require, exports, lifecycle_1, languagePacks_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.LocalizationsUpdater = void 0;
    let LocalizationsUpdater = class LocalizationsUpdater extends lifecycle_1.Disposable {
        constructor(localizationsService) {
            super();
            this.localizationsService = localizationsService;
            this.updateLocalizations();
        }
        updateLocalizations() {
            this.localizationsService.update();
        }
    };
    exports.LocalizationsUpdater = LocalizationsUpdater;
    exports.LocalizationsUpdater = LocalizationsUpdater = __decorate([
        __param(0, languagePacks_1.ILanguagePackService)
    ], LocalizationsUpdater);
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibG9jYWxpemF0aW9uc1VwZGF0ZXIuanMiLCJzb3VyY2VSb290IjoiZmlsZTovLy93b3Jrc3BhY2UvYXBwZmxvdy9zcmMvIiwic291cmNlcyI6WyJ2cy9jb2RlL25vZGUvc2hhcmVkUHJvY2Vzcy9jb250cmliL2xvY2FsaXphdGlvbnNVcGRhdGVyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Z0dBR2dHOzs7Ozs7Ozs7Ozs7OztJQU16RixJQUFNLG9CQUFvQixHQUExQixNQUFNLG9CQUFxQixTQUFRLHNCQUFVO1FBRW5ELFlBQ3dDLG9CQUErQztZQUV0RixLQUFLLEVBQUUsQ0FBQztZQUYrQix5QkFBb0IsR0FBcEIsb0JBQW9CLENBQTJCO1lBSXRGLElBQUksQ0FBQyxtQkFBbUIsRUFBRSxDQUFDO1FBQzVCLENBQUM7UUFFTyxtQkFBbUI7WUFDMUIsSUFBSSxDQUFDLG9CQUFvQixDQUFDLE1BQU0sRUFBRSxDQUFDO1FBQ3BDLENBQUM7S0FDRCxDQUFBO0lBYlksb0RBQW9CO21DQUFwQixvQkFBb0I7UUFHOUIsV0FBQSxvQ0FBb0IsQ0FBQTtPQUhWLG9CQUFvQixDQWFoQyJ9