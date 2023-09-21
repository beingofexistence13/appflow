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
define(["require", "exports", "vs/base/browser/dom", "vs/platform/configuration/common/configuration", "vs/workbench/services/lifecycle/common/lifecycle"], function (require, exports, dom, configuration_1, lifecycle_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$bfb = void 0;
    let $bfb = class $bfb {
        constructor(c, d) {
            this.c = c;
            this.d = d;
            this.a = new Map();
            this.d.onDidChangeConfiguration(e => {
                if (e.affectsConfiguration('workbench.iconTheme')) {
                    this.g();
                }
            });
        }
        dispose() {
            this.b?.remove();
            this.b = undefined;
        }
        get f() {
            if (!this.b) {
                this.b = dom.$XO();
                this.b.className = 'webview-icons';
            }
            return this.b;
        }
        setIcons(webviewId, iconPath) {
            if (iconPath) {
                this.a.set(webviewId, iconPath);
            }
            else {
                this.a.delete(webviewId);
            }
            this.g();
        }
        async g() {
            await this.c.when(1 /* LifecyclePhase.Starting */);
            const cssRules = [];
            if (this.d.getValue('workbench.iconTheme') !== null) {
                for (const [key, value] of this.a) {
                    const webviewSelector = `.show-file-icons .webview-${key}-name-file-icon::before`;
                    try {
                        cssRules.push(`.monaco-workbench.vs ${webviewSelector}, .monaco-workbench.hc-light ${webviewSelector} { content: ""; background-image: ${dom.$nP(value.light)}; }`, `.monaco-workbench.vs-dark ${webviewSelector}, .monaco-workbench.hc-black ${webviewSelector} { content: ""; background-image: ${dom.$nP(value.dark)}; }`);
                    }
                    catch {
                        // noop
                    }
                }
            }
            this.f.textContent = cssRules.join('\n');
        }
    };
    exports.$bfb = $bfb;
    exports.$bfb = $bfb = __decorate([
        __param(0, lifecycle_1.$7y),
        __param(1, configuration_1.$8h)
    ], $bfb);
});
//# sourceMappingURL=webviewIconManager.js.map