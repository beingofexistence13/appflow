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
define(["require", "exports", "vs/base/common/lifecycle", "vs/editor/common/languages/language", "vs/platform/theme/common/themeService", "vs/platform/log/common/log", "vs/editor/common/services/semanticTokensProviderStyling", "vs/editor/common/services/semanticTokensStyling", "vs/platform/instantiation/common/extensions"], function (require, exports, lifecycle_1, language_1, themeService_1, log_1, semanticTokensProviderStyling_1, semanticTokensStyling_1, extensions_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$pBb = void 0;
    let $pBb = class $pBb extends lifecycle_1.$kc {
        constructor(b, c, f) {
            super();
            this.b = b;
            this.c = c;
            this.f = f;
            this.a = new WeakMap();
            this.B(this.b.onDidColorThemeChange(() => {
                this.a = new WeakMap();
            }));
        }
        getStyling(provider) {
            if (!this.a.has(provider)) {
                this.a.set(provider, new semanticTokensProviderStyling_1.$t0(provider.getLegend(), this.b, this.f, this.c));
            }
            return this.a.get(provider);
        }
    };
    exports.$pBb = $pBb;
    exports.$pBb = $pBb = __decorate([
        __param(0, themeService_1.$gv),
        __param(1, log_1.$5i),
        __param(2, language_1.$ct)
    ], $pBb);
    (0, extensions_1.$mr)(semanticTokensStyling_1.$E0, $pBb, 1 /* InstantiationType.Delayed */);
});
//# sourceMappingURL=semanticTokensStylingService.js.map