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
define(["require", "exports", "vs/platform/contextkey/common/contextkey", "vs/platform/contextview/browser/contextView", "vs/platform/keybinding/common/keybinding", "vs/workbench/contrib/codeEditor/browser/find/simpleFindWidget", "vs/workbench/contrib/webview/browser/webview"], function (require, exports, contextkey_1, contextView_1, keybinding_1, simpleFindWidget_1, webview_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$54b = void 0;
    let $54b = class $54b extends simpleFindWidget_1.$zWb {
        async S(dataChanged) {
            return undefined;
        }
        constructor(gb, contextViewService, contextKeyService, keybindingService) {
            super({
                showCommonFindToggles: false,
                checkImeCompletionState: gb.checkImeCompletionState,
                enableSash: true,
            }, contextViewService, contextKeyService, keybindingService);
            this.gb = gb;
            this.fb = webview_1.$Jbb.bindTo(contextKeyService);
            this.B(gb.hasFindResult(hasResult => {
                this.bb(hasResult);
                this.cb();
            }));
            this.B(gb.onDidStopFind(() => {
                this.bb(false);
            }));
        }
        find(previous) {
            const val = this.U;
            if (val) {
                this.gb.find(val, previous);
            }
        }
        hide(animated = true) {
            super.hide(animated);
            this.gb.stopFind(true);
            this.gb.focus();
        }
        N() {
            const val = this.U;
            if (val) {
                this.gb.updateFind(val);
            }
            else {
                this.gb.stopFind(false);
            }
            return false;
        }
        O() {
            this.fb.set(true);
        }
        P() {
            this.fb.reset();
        }
        Q() { }
        R() { }
        findFirst() { }
    };
    exports.$54b = $54b;
    exports.$54b = $54b = __decorate([
        __param(1, contextView_1.$VZ),
        __param(2, contextkey_1.$3i),
        __param(3, keybinding_1.$2D)
    ], $54b);
});
//# sourceMappingURL=webviewFindWidget.js.map