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
define(["require", "exports", "vs/base/common/severity", "vs/base/common/lifecycle", "vs/platform/dialogs/common/dialogs", "vs/workbench/common/dialogs", "vs/platform/instantiation/common/extensions", "vs/workbench/services/environment/common/environmentService", "vs/platform/log/common/log"], function (require, exports, severity_1, lifecycle_1, dialogs_1, dialogs_2, extensions_1, environmentService_1, log_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$tyb = void 0;
    let $tyb = class $tyb extends lifecycle_1.$kc {
        constructor(a, b) {
            super();
            this.a = a;
            this.b = b;
            this.model = this.B(new dialogs_2.$syb());
            this.onWillShowDialog = this.model.onWillShowDialog;
            this.onDidShowDialog = this.model.onDidShowDialog;
        }
        c() {
            if (this.a.isExtensionDevelopment && this.a.extensionTestsLocationURI) {
                return true; // integration tests
            }
            return !!this.a.enableSmokeTestDriver; // smoke tests
        }
        async confirm(confirmation) {
            if (this.c()) {
                this.b.trace('DialogService: refused to show confirmation dialog in tests.');
                return { confirmed: true };
            }
            const handle = this.model.show({ confirmArgs: { confirmation } });
            return await handle.result;
        }
        async prompt(prompt) {
            if (this.c()) {
                throw new Error(`DialogService: refused to show dialog in tests. Contents: ${prompt.message}`);
            }
            const handle = this.model.show({ promptArgs: { prompt } });
            return await handle.result;
        }
        async input(input) {
            if (this.c()) {
                throw new Error('DialogService: refused to show input dialog in tests.');
            }
            const handle = this.model.show({ inputArgs: { input } });
            return await handle.result;
        }
        async info(message, detail) {
            await this.prompt({ type: severity_1.default.Info, message, detail });
        }
        async warn(message, detail) {
            await this.prompt({ type: severity_1.default.Warning, message, detail });
        }
        async error(message, detail) {
            await this.prompt({ type: severity_1.default.Error, message, detail });
        }
        async about() {
            if (this.c()) {
                throw new Error('DialogService: refused to show about dialog in tests.');
            }
            const handle = this.model.show({});
            await handle.result;
        }
    };
    exports.$tyb = $tyb;
    exports.$tyb = $tyb = __decorate([
        __param(0, environmentService_1.$hJ),
        __param(1, log_1.$5i)
    ], $tyb);
    (0, extensions_1.$mr)(dialogs_1.$oA, $tyb, 1 /* InstantiationType.Delayed */);
});
//# sourceMappingURL=dialogService.js.map