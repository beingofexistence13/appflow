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
define(["require", "exports", "vs/nls!vs/workbench/contrib/remote/browser/remoteStartEntry", "vs/base/common/lifecycle", "vs/platform/commands/common/commands", "vs/platform/product/common/productService", "vs/platform/actions/common/actions", "vs/platform/extensionManagement/common/extensionManagement", "vs/platform/telemetry/common/telemetry", "vs/platform/extensions/common/extensions", "vs/workbench/services/extensionManagement/common/extensionManagement", "vs/platform/contextkey/common/contextkey"], function (require, exports, nls, lifecycle_1, commands_1, productService_1, actions_1, extensionManagement_1, telemetry_1, extensions_1, extensionManagement_2, contextkey_1) {
    "use strict";
    var $i5b_1;
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$i5b = exports.$h5b = void 0;
    exports.$h5b = new contextkey_1.$2i('showRemoteStartEntryInWeb', false);
    let $i5b = class $i5b extends lifecycle_1.$kc {
        static { $i5b_1 = this; }
        static { this.a = 'workbench.action.remote.showWebStartEntryActions'; }
        constructor(f, g, h, j, m, n) {
            super();
            this.f = f;
            this.g = g;
            this.h = h;
            this.j = j;
            this.m = m;
            this.n = n;
            const remoteExtensionTips = this.g.remoteExtensionTips?.['tunnel'];
            this.c = remoteExtensionTips?.startEntry?.startCommand ?? '';
            this.b = remoteExtensionTips?.extensionId ?? '';
            this.t();
            this.r();
            this.s();
        }
        r() {
            const category = { value: nls.localize(0, null), original: 'Remote' };
            // Show Remote Start Action
            const startEntry = this;
            (0, actions_1.$Xu)(class extends actions_1.$Wu {
                constructor() {
                    super({
                        id: $i5b_1.a,
                        category,
                        title: { value: nls.localize(1, null), original: 'Show Remote Start Entry for web' },
                        f1: false
                    });
                }
                async run() {
                    await startEntry.u();
                }
            });
        }
        s() {
            this.B(this.j.onEnablementChanged(async (result) => {
                for (const ext of result) {
                    if (extensions_1.$Vl.equals(this.b, ext.identifier.id)) {
                        if (this.j.isEnabled(ext)) {
                            exports.$h5b.bindTo(this.n).set(true);
                        }
                        else {
                            exports.$h5b.bindTo(this.n).set(false);
                        }
                    }
                }
            }));
        }
        async t() {
            // Check if installed and enabled
            const installed = (await this.h.getInstalled()).find(value => extensions_1.$Vl.equals(value.identifier.id, this.b));
            if (installed) {
                if (this.j.isEnabled(installed)) {
                    exports.$h5b.bindTo(this.n).set(true);
                }
            }
        }
        async u() {
            this.f.executeCommand(this.c);
            this.m.publicLog2('workbenchActionExecuted', {
                id: this.c,
                from: 'remote start entry'
            });
        }
    };
    exports.$i5b = $i5b;
    exports.$i5b = $i5b = $i5b_1 = __decorate([
        __param(0, commands_1.$Fr),
        __param(1, productService_1.$kj),
        __param(2, extensionManagement_1.$2n),
        __param(3, extensionManagement_2.$icb),
        __param(4, telemetry_1.$9k),
        __param(5, contextkey_1.$3i)
    ], $i5b);
});
//# sourceMappingURL=remoteStartEntry.js.map