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
define(["require", "exports", "vs/editor/browser/services/codeEditorService", "vs/editor/common/languageSelector", "vs/nls!vs/workbench/contrib/share/browser/shareService", "vs/platform/contextkey/common/contextkey", "vs/platform/label/common/label", "vs/platform/quickinput/common/quickInput", "vs/platform/telemetry/common/telemetry"], function (require, exports, codeEditorService_1, languageSelector_1, nls_1, contextkey_1, label_1, quickInput_1, telemetry_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$V1b = exports.$U1b = void 0;
    exports.$U1b = new contextkey_1.$2i('shareProviderCount', 0, (0, nls_1.localize)(0, null));
    let $V1b = class $V1b {
        constructor(d, e, f, g, h) {
            this.d = d;
            this.e = e;
            this.f = f;
            this.g = g;
            this.h = h;
            this.c = new Set();
            this.providerCount = exports.$U1b.bindTo(this.d);
        }
        registerShareProvider(provider) {
            this.c.add(provider);
            this.providerCount.set(this.c.size);
            return {
                dispose: () => {
                    this.c.delete(provider);
                    this.providerCount.set(this.c.size);
                }
            };
        }
        getShareActions() {
            // todo@joyceerhl return share actions
            return [];
        }
        async provideShare(item, token) {
            const language = this.g.getActiveCodeEditor()?.getModel()?.getLanguageId() ?? '';
            const providers = [...this.c.values()]
                .filter((p) => (0, languageSelector_1.$cF)(p.selector, item.resourceUri, language, true, undefined, undefined) > 0)
                .sort((a, b) => a.priority - b.priority);
            if (providers.length === 0) {
                return undefined;
            }
            if (providers.length === 1) {
                this.h.publicLog2('shareService.share', { providerId: providers[0].id });
                return providers[0].provideShare(item, token);
            }
            const items = providers.map((p) => ({ label: p.label, provider: p }));
            const selected = await this.f.pick(items, { canPickMany: false, placeHolder: (0, nls_1.localize)(1, null, this.e.getUriLabel(item.resourceUri)) }, token);
            if (selected !== undefined) {
                this.h.publicLog2('shareService.share', { providerId: selected.provider.id });
                return selected.provider.provideShare(item, token);
            }
            return;
        }
    };
    exports.$V1b = $V1b;
    exports.$V1b = $V1b = __decorate([
        __param(0, contextkey_1.$3i),
        __param(1, label_1.$Vz),
        __param(2, quickInput_1.$Gq),
        __param(3, codeEditorService_1.$nV),
        __param(4, telemetry_1.$9k)
    ], $V1b);
});
//# sourceMappingURL=shareService.js.map