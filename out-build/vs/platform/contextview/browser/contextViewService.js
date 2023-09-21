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
define(["require", "exports", "vs/base/browser/ui/contextview/contextview", "vs/base/common/lifecycle", "vs/platform/layout/browser/layoutService"], function (require, exports, contextview_1, lifecycle_1, layoutService_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$JBb = void 0;
    let $JBb = class $JBb extends lifecycle_1.$kc {
        constructor(g) {
            super();
            this.g = g;
            this.a = lifecycle_1.$kc.None;
            this.c = g.hasContainer ? g.container : null;
            this.b = this.B(new contextview_1.$5P(this.c, 1 /* ContextViewDOMPosition.ABSOLUTE */));
            this.layout();
            this.B(g.onDidLayout(() => this.layout()));
        }
        // ContextView
        h(container, domPosition) {
            this.b.setContainer(container, domPosition || 1 /* ContextViewDOMPosition.ABSOLUTE */);
        }
        showContextView(delegate, container, shadowRoot) {
            if (container) {
                if (container !== this.c || this.f !== shadowRoot) {
                    this.c = container;
                    this.h(container, shadowRoot ? 3 /* ContextViewDOMPosition.FIXED_SHADOW */ : 2 /* ContextViewDOMPosition.FIXED */);
                }
            }
            else {
                if (this.g.hasContainer && this.c !== this.g.container) {
                    this.c = this.g.container;
                    this.h(this.c, 1 /* ContextViewDOMPosition.ABSOLUTE */);
                }
            }
            this.f = shadowRoot;
            this.b.show(delegate);
            const disposable = (0, lifecycle_1.$ic)(() => {
                if (this.a === disposable) {
                    this.hideContextView();
                }
            });
            this.a = disposable;
            return disposable;
        }
        getContextViewElement() {
            return this.b.getViewElement();
        }
        layout() {
            this.b.layout();
        }
        hideContextView(data) {
            this.b.hide(data);
        }
    };
    exports.$JBb = $JBb;
    exports.$JBb = $JBb = __decorate([
        __param(0, layoutService_1.$XT)
    ], $JBb);
});
//# sourceMappingURL=contextViewService.js.map