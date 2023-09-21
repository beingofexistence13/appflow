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
define(["require", "exports", "./extHostTypes", "vs/workbench/api/common/extHostRpcService", "vs/base/common/event"], function (require, exports, extHostTypes_1, extHostRpcService_1, event_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.ExtHostTheming = void 0;
    let ExtHostTheming = class ExtHostTheming {
        constructor(_extHostRpc) {
            this._actual = new extHostTypes_1.ColorTheme(extHostTypes_1.ColorThemeKind.Dark);
            this._onDidChangeActiveColorTheme = new event_1.Emitter();
        }
        get activeColorTheme() {
            return this._actual;
        }
        $onColorThemeChange(type) {
            let kind;
            switch (type) {
                case 'light':
                    kind = extHostTypes_1.ColorThemeKind.Light;
                    break;
                case 'hcDark':
                    kind = extHostTypes_1.ColorThemeKind.HighContrast;
                    break;
                case 'hcLight':
                    kind = extHostTypes_1.ColorThemeKind.HighContrastLight;
                    break;
                default:
                    kind = extHostTypes_1.ColorThemeKind.Dark;
            }
            this._actual = new extHostTypes_1.ColorTheme(kind);
            this._onDidChangeActiveColorTheme.fire(this._actual);
        }
        get onDidChangeActiveColorTheme() {
            return this._onDidChangeActiveColorTheme.event;
        }
    };
    exports.ExtHostTheming = ExtHostTheming;
    exports.ExtHostTheming = ExtHostTheming = __decorate([
        __param(0, extHostRpcService_1.IExtHostRpcService)
    ], ExtHostTheming);
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZXh0SG9zdFRoZW1pbmcuanMiLCJzb3VyY2VSb290IjoiZmlsZTovLy93b3Jrc3BhY2UvYXBwZmxvdy9zcmMvIiwic291cmNlcyI6WyJ2cy93b3JrYmVuY2gvYXBpL2NvbW1vbi9leHRIb3N0VGhlbWluZy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O2dHQUdnRzs7Ozs7Ozs7Ozs7Ozs7SUFPekYsSUFBTSxjQUFjLEdBQXBCLE1BQU0sY0FBYztRQU8xQixZQUNxQixXQUErQjtZQUVuRCxJQUFJLENBQUMsT0FBTyxHQUFHLElBQUkseUJBQVUsQ0FBQyw2QkFBYyxDQUFDLElBQUksQ0FBQyxDQUFDO1lBQ25ELElBQUksQ0FBQyw0QkFBNEIsR0FBRyxJQUFJLGVBQU8sRUFBYyxDQUFDO1FBQy9ELENBQUM7UUFFRCxJQUFXLGdCQUFnQjtZQUMxQixPQUFPLElBQUksQ0FBQyxPQUFPLENBQUM7UUFDckIsQ0FBQztRQUVELG1CQUFtQixDQUFDLElBQVk7WUFDL0IsSUFBSSxJQUFJLENBQUM7WUFDVCxRQUFRLElBQUksRUFBRTtnQkFDYixLQUFLLE9BQU87b0JBQUUsSUFBSSxHQUFHLDZCQUFjLENBQUMsS0FBSyxDQUFDO29CQUFDLE1BQU07Z0JBQ2pELEtBQUssUUFBUTtvQkFBRSxJQUFJLEdBQUcsNkJBQWMsQ0FBQyxZQUFZLENBQUM7b0JBQUMsTUFBTTtnQkFDekQsS0FBSyxTQUFTO29CQUFFLElBQUksR0FBRyw2QkFBYyxDQUFDLGlCQUFpQixDQUFDO29CQUFDLE1BQU07Z0JBQy9EO29CQUNDLElBQUksR0FBRyw2QkFBYyxDQUFDLElBQUksQ0FBQzthQUM1QjtZQUNELElBQUksQ0FBQyxPQUFPLEdBQUcsSUFBSSx5QkFBVSxDQUFDLElBQUksQ0FBQyxDQUFDO1lBQ3BDLElBQUksQ0FBQyw0QkFBNEIsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxDQUFDO1FBQ3RELENBQUM7UUFFRCxJQUFXLDJCQUEyQjtZQUNyQyxPQUFPLElBQUksQ0FBQyw0QkFBNEIsQ0FBQyxLQUFLLENBQUM7UUFDaEQsQ0FBQztLQUNELENBQUE7SUFsQ1ksd0NBQWM7NkJBQWQsY0FBYztRQVF4QixXQUFBLHNDQUFrQixDQUFBO09BUlIsY0FBYyxDQWtDMUIifQ==