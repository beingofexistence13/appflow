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
define(["require", "exports", "vs/base/common/event", "vs/base/common/lifecycle", "vs/platform/instantiation/common/instantiation", "vs/workbench/contrib/webview/browser/themeing", "vs/workbench/contrib/webview/browser/webviewElement", "./overlayWebview"], function (require, exports, event_1, lifecycle_1, instantiation_1, themeing_1, webviewElement_1, overlayWebview_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$84b = void 0;
    let $84b = class $84b extends lifecycle_1.$kc {
        constructor(b) {
            super();
            this.b = b;
            this.g = new Set();
            this.h = this.B(new event_1.$fd());
            this.onDidChangeActiveWebview = this.h.event;
            this.a = this.b.createInstance(themeing_1.$24b);
        }
        get activeWebview() { return this.c; }
        f(value) {
            if (value !== this.c) {
                this.c = value;
                this.h.fire(value);
            }
        }
        get webviews() {
            return this.g.values();
        }
        createWebviewElement(initInfo) {
            const webview = this.b.createInstance(webviewElement_1.$64b, initInfo, this.a);
            this.j(webview);
            return webview;
        }
        createWebviewOverlay(initInfo) {
            const webview = this.b.createInstance(overlayWebview_1.$74b, initInfo);
            this.j(webview);
            return webview;
        }
        j(webview) {
            this.g.add(webview);
            webview.onDidFocus(() => {
                this.f(webview);
            });
            const onBlur = () => {
                if (this.c === webview) {
                    this.f(undefined);
                }
            };
            webview.onDidBlur(onBlur);
            webview.onDidDispose(() => {
                onBlur();
                this.g.delete(webview);
            });
        }
    };
    exports.$84b = $84b;
    exports.$84b = $84b = __decorate([
        __param(0, instantiation_1.$Ah)
    ], $84b);
});
//# sourceMappingURL=webviewService.js.map