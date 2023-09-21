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
define(["require", "exports", "vs/base/common/event", "vs/platform/native/common/native", "vs/platform/instantiation/common/extensions", "vs/base/common/lifecycle", "vs/workbench/services/themes/common/hostColorSchemeService", "vs/workbench/services/environment/electron-sandbox/environmentService", "vs/platform/storage/common/storage", "vs/base/common/types"], function (require, exports, event_1, native_1, extensions_1, lifecycle_1, hostColorSchemeService_1, environmentService_1, storage_1, types_1) {
    "use strict";
    var $Q_b_1;
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$Q_b = void 0;
    let $Q_b = class $Q_b extends lifecycle_1.$kc {
        static { $Q_b_1 = this; }
        static { this.STORAGE_KEY = 'HostColorSchemeData'; }
        constructor(b, environmentService, c) {
            super();
            this.b = b;
            this.c = c;
            this.a = this.B(new event_1.$fd());
            this.onDidChangeColorScheme = this.a.event;
            // register listener with the OS
            this.B(this.b.onDidChangeColorScheme(scheme => this.g(scheme)));
            const initial = this.f() ?? environmentService.window.colorScheme;
            this.dark = initial.dark;
            this.highContrast = initial.highContrast;
            // fetch the actual value from the OS
            this.b.getOSColorScheme().then(scheme => this.g(scheme));
        }
        f() {
            const stored = this.c.get($Q_b_1.STORAGE_KEY, -1 /* StorageScope.APPLICATION */);
            if (stored) {
                try {
                    const scheme = JSON.parse(stored);
                    if ((0, types_1.$lf)(scheme) && (0, types_1.$pf)(scheme.highContrast) && (0, types_1.$pf)(scheme.dark)) {
                        return scheme;
                    }
                }
                catch (e) {
                    // ignore
                }
            }
            return undefined;
        }
        g({ highContrast, dark }) {
            if (dark !== this.dark || highContrast !== this.highContrast) {
                this.dark = dark;
                this.highContrast = highContrast;
                this.c.store($Q_b_1.STORAGE_KEY, JSON.stringify({ highContrast, dark }), -1 /* StorageScope.APPLICATION */, 1 /* StorageTarget.MACHINE */);
                this.a.fire();
            }
        }
    };
    exports.$Q_b = $Q_b;
    exports.$Q_b = $Q_b = $Q_b_1 = __decorate([
        __param(0, native_1.$05b),
        __param(1, environmentService_1.$1$b),
        __param(2, storage_1.$Vo)
    ], $Q_b);
    (0, extensions_1.$mr)(hostColorSchemeService_1.$vzb, $Q_b, 1 /* InstantiationType.Delayed */);
});
//# sourceMappingURL=nativeHostColorSchemeService.js.map