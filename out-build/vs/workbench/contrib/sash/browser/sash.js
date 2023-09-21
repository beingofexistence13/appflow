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
define(["require", "exports", "vs/base/common/numbers", "vs/base/browser/ui/sash/sash", "vs/base/common/event", "vs/base/common/lifecycle", "vs/platform/configuration/common/configuration"], function (require, exports, numbers_1, sash_1, event_1, lifecycle_1, configuration_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$tPb = exports.$sPb = exports.$rPb = void 0;
    exports.$rPb = 1;
    exports.$sPb = 20; // see also https://ux.stackexchange.com/questions/39023/what-is-the-optimum-button-size-of-touch-screen-applications
    let $tPb = class $tPb {
        constructor(b) {
            this.b = b;
            this.a = new lifecycle_1.$jc();
            const onDidChangeSize = event_1.Event.filter(b.onDidChangeConfiguration, e => e.affectsConfiguration('workbench.sash.size'));
            onDidChangeSize(this.c, this, this.a);
            this.c();
            const onDidChangeHoverDelay = event_1.Event.filter(b.onDidChangeConfiguration, e => e.affectsConfiguration('workbench.sash.hoverDelay'));
            onDidChangeHoverDelay(this.d, this, this.a);
            this.d();
        }
        c() {
            const configuredSize = this.b.getValue('workbench.sash.size');
            const size = (0, numbers_1.$Hl)(configuredSize, 4, 20);
            const hoverSize = (0, numbers_1.$Hl)(configuredSize, 1, 8);
            document.documentElement.style.setProperty('--vscode-sash-size', size + 'px');
            document.documentElement.style.setProperty('--vscode-sash-hover-size', hoverSize + 'px');
            (0, sash_1.$$Q)(size);
        }
        d() {
            (0, sash_1.$_Q)(this.b.getValue('workbench.sash.hoverDelay'));
        }
        dispose() {
            this.a.dispose();
        }
    };
    exports.$tPb = $tPb;
    exports.$tPb = $tPb = __decorate([
        __param(0, configuration_1.$8h)
    ], $tPb);
});
//# sourceMappingURL=sash.js.map