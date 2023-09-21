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
define(["require", "exports", "../common/extHost.protocol", "vs/workbench/services/extensions/common/extHostCustomers", "vs/platform/theme/common/themeService"], function (require, exports, extHost_protocol_1, extHostCustomers_1, themeService_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$6kb = void 0;
    let $6kb = class $6kb {
        constructor(extHostContext, themeService) {
            this.a = themeService;
            this.b = extHostContext.getProxy(extHost_protocol_1.$2J.ExtHostTheming);
            this.c = this.a.onDidColorThemeChange(e => {
                this.b.$onColorThemeChange(this.a.getColorTheme().type);
            });
            this.b.$onColorThemeChange(this.a.getColorTheme().type);
        }
        dispose() {
            this.c.dispose();
        }
    };
    exports.$6kb = $6kb;
    exports.$6kb = $6kb = __decorate([
        (0, extHostCustomers_1.$jbb)(extHost_protocol_1.$1J.MainThreadTheming),
        __param(1, themeService_1.$gv)
    ], $6kb);
});
//# sourceMappingURL=mainThreadTheming.js.map