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
    exports.$Gcc = void 0;
    let $Gcc = class $Gcc {
        constructor(_extHostRpc) {
            this.a = new extHostTypes_1.$mL(extHostTypes_1.ColorThemeKind.Dark);
            this.b = new event_1.$fd();
        }
        get activeColorTheme() {
            return this.a;
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
            this.a = new extHostTypes_1.$mL(kind);
            this.b.fire(this.a);
        }
        get onDidChangeActiveColorTheme() {
            return this.b.event;
        }
    };
    exports.$Gcc = $Gcc;
    exports.$Gcc = $Gcc = __decorate([
        __param(0, extHostRpcService_1.$2L)
    ], $Gcc);
});
//# sourceMappingURL=extHostTheming.js.map