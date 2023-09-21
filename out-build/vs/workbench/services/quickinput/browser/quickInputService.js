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
define(["require", "exports", "vs/platform/layout/browser/layoutService", "vs/platform/instantiation/common/instantiation", "vs/platform/theme/common/themeService", "vs/platform/configuration/common/configuration", "vs/platform/contextkey/common/contextkey", "vs/platform/keybinding/common/keybinding", "vs/platform/quickinput/browser/quickInputService", "vs/platform/instantiation/common/extensions", "vs/platform/quickinput/common/quickInput", "vs/workbench/browser/quickaccess", "vs/workbench/services/hover/browser/hover"], function (require, exports, layoutService_1, instantiation_1, themeService_1, configuration_1, contextkey_1, keybinding_1, quickInputService_1, extensions_1, quickInput_1, quickaccess_1, hover_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$JAb = void 0;
    let $JAb = class $JAb extends quickInputService_1.$IAb {
        constructor(H, instantiationService, I, contextKeyService, themeService, layoutService, J) {
            super(instantiationService, contextKeyService, themeService, layoutService);
            this.H = H;
            this.I = I;
            this.J = J;
            this.F = new QuickInputHoverDelegate(this.H, this.J);
            this.G = quickaccess_1.$Utb.bindTo(this.s);
            this.L();
        }
        L() {
            this.B(this.onShow(() => this.G.set(true)));
            this.B(this.onHide(() => this.G.set(false)));
        }
        u() {
            return super.u(this.t, {
                ignoreFocusOut: () => !this.H.getValue('workbench.quickOpen.closeOnFocusLost'),
                backKeybindingLabel: () => this.I.lookupKeybinding('workbench.action.quickInputBack')?.getLabel() || undefined,
                hoverDelegate: this.F
            });
        }
    };
    exports.$JAb = $JAb;
    exports.$JAb = $JAb = __decorate([
        __param(0, configuration_1.$8h),
        __param(1, instantiation_1.$Ah),
        __param(2, keybinding_1.$2D),
        __param(3, contextkey_1.$3i),
        __param(4, themeService_1.$gv),
        __param(5, layoutService_1.$XT),
        __param(6, hover_1.$zib)
    ], $JAb);
    class QuickInputHoverDelegate {
        get delay() {
            if (Date.now() - this.a < 200) {
                return 0; // show instantly when a hover was recently shown
            }
            return this.b.getValue('workbench.hover.delay');
        }
        constructor(b, c) {
            this.b = b;
            this.c = c;
            this.a = 0;
            this.placement = 'element';
        }
        showHover(options, focus) {
            return this.c.showHover({
                ...options,
                showHoverHint: true,
                hideOnKeyDown: false,
                skipFadeInAnimation: true,
            }, focus);
        }
        onDidHideHover() {
            this.a = Date.now();
        }
    }
    (0, extensions_1.$mr)(quickInput_1.$Gq, $JAb, 1 /* InstantiationType.Delayed */);
});
//# sourceMappingURL=quickInputService.js.map