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
define(["require", "exports", "vs/platform/clipboard/common/clipboardService", "vs/platform/configuration/common/configuration", "vs/platform/dialogs/common/dialogs", "vs/platform/keybinding/common/keybinding", "vs/platform/layout/browser/layoutService", "vs/platform/log/common/log", "vs/platform/native/common/native", "vs/platform/product/common/productService", "vs/platform/registry/common/platform", "vs/workbench/common/contributions", "vs/workbench/browser/parts/dialogs/dialogHandler", "vs/workbench/electron-sandbox/parts/dialogs/dialogHandler", "vs/base/common/lifecycle", "vs/platform/instantiation/common/instantiation"], function (require, exports, clipboardService_1, configuration_1, dialogs_1, keybinding_1, layoutService_1, log_1, native_1, productService_1, platform_1, contributions_1, dialogHandler_1, dialogHandler_2, lifecycle_1, instantiation_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$w_b = void 0;
    let $w_b = class $w_b extends lifecycle_1.$kc {
        constructor(g, h, logService, layoutService, keybindingService, instantiationService, productService, clipboardService, nativeHostService) {
            super();
            this.g = g;
            this.h = h;
            this.b = new dialogHandler_1.$W1b(logService, layoutService, keybindingService, instantiationService, productService, clipboardService);
            this.a = new dialogHandler_2.$v_b(logService, nativeHostService, productService, clipboardService);
            this.c = this.h.model;
            this.B(this.c.onWillShowDialog(() => {
                if (!this.f) {
                    this.j();
                }
            }));
            this.j();
        }
        async j() {
            while (this.c.dialogs.length) {
                this.f = this.c.dialogs[0];
                let result = undefined;
                // Confirm
                if (this.f.args.confirmArgs) {
                    const args = this.f.args.confirmArgs;
                    result = (this.m || args?.confirmation.custom) ?
                        await this.b.confirm(args.confirmation) :
                        await this.a.confirm(args.confirmation);
                }
                // Input (custom only)
                else if (this.f.args.inputArgs) {
                    const args = this.f.args.inputArgs;
                    result = await this.b.input(args.input);
                }
                // Prompt
                else if (this.f.args.promptArgs) {
                    const args = this.f.args.promptArgs;
                    result = (this.m || args?.prompt.custom) ?
                        await this.b.prompt(args.prompt) :
                        await this.a.prompt(args.prompt);
                }
                // About
                else {
                    if (this.m) {
                        await this.b.about();
                    }
                    else {
                        await this.a.about();
                    }
                }
                this.f.close(result);
                this.f = undefined;
            }
        }
        get m() {
            return this.g.getValue('window.dialogStyle') === 'custom';
        }
    };
    exports.$w_b = $w_b;
    exports.$w_b = $w_b = __decorate([
        __param(0, configuration_1.$8h),
        __param(1, dialogs_1.$oA),
        __param(2, log_1.$5i),
        __param(3, layoutService_1.$XT),
        __param(4, keybinding_1.$2D),
        __param(5, instantiation_1.$Ah),
        __param(6, productService_1.$kj),
        __param(7, clipboardService_1.$UZ),
        __param(8, native_1.$05b)
    ], $w_b);
    const workbenchRegistry = platform_1.$8m.as(contributions_1.Extensions.Workbench);
    workbenchRegistry.registerWorkbenchContribution($w_b, 1 /* LifecyclePhase.Starting */);
});
//# sourceMappingURL=dialog.contribution.js.map