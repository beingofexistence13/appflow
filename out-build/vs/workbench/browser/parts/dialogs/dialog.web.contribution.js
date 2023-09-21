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
define(["require", "exports", "vs/platform/clipboard/common/clipboardService", "vs/platform/dialogs/common/dialogs", "vs/platform/keybinding/common/keybinding", "vs/platform/layout/browser/layoutService", "vs/platform/log/common/log", "vs/platform/product/common/productService", "vs/platform/registry/common/platform", "vs/workbench/common/contributions", "vs/workbench/browser/parts/dialogs/dialogHandler", "vs/base/common/lifecycle", "vs/platform/instantiation/common/instantiation"], function (require, exports, clipboardService_1, dialogs_1, keybinding_1, layoutService_1, log_1, productService_1, platform_1, contributions_1, dialogHandler_1, lifecycle_1, instantiation_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$X1b = void 0;
    let $X1b = class $X1b extends lifecycle_1.$kc {
        constructor(f, logService, layoutService, keybindingService, instantiationService, productService, clipboardService) {
            super();
            this.f = f;
            this.b = new dialogHandler_1.$W1b(logService, layoutService, keybindingService, instantiationService, productService, clipboardService);
            this.a = this.f.model;
            this.B(this.a.onWillShowDialog(() => {
                if (!this.c) {
                    this.g();
                }
            }));
            this.g();
        }
        async g() {
            while (this.a.dialogs.length) {
                this.c = this.a.dialogs[0];
                let result = undefined;
                if (this.c.args.confirmArgs) {
                    const args = this.c.args.confirmArgs;
                    result = await this.b.confirm(args.confirmation);
                }
                else if (this.c.args.inputArgs) {
                    const args = this.c.args.inputArgs;
                    result = await this.b.input(args.input);
                }
                else if (this.c.args.promptArgs) {
                    const args = this.c.args.promptArgs;
                    result = await this.b.prompt(args.prompt);
                }
                else {
                    await this.b.about();
                }
                this.c.close(result);
                this.c = undefined;
            }
        }
    };
    exports.$X1b = $X1b;
    exports.$X1b = $X1b = __decorate([
        __param(0, dialogs_1.$oA),
        __param(1, log_1.$5i),
        __param(2, layoutService_1.$XT),
        __param(3, keybinding_1.$2D),
        __param(4, instantiation_1.$Ah),
        __param(5, productService_1.$kj),
        __param(6, clipboardService_1.$UZ)
    ], $X1b);
    const workbenchRegistry = platform_1.$8m.as(contributions_1.Extensions.Workbench);
    workbenchRegistry.registerWorkbenchContribution($X1b, 1 /* LifecyclePhase.Starting */);
});
//# sourceMappingURL=dialog.web.contribution.js.map