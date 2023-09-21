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
define(["require", "exports", "vs/nls!vs/workbench/services/clipboard/browser/clipboardService", "vs/platform/instantiation/common/extensions", "vs/platform/clipboard/common/clipboardService", "vs/platform/clipboard/browser/clipboardService", "vs/platform/notification/common/notification", "vs/platform/opener/common/opener", "vs/base/common/functional", "vs/base/common/lifecycle", "vs/workbench/services/environment/common/environmentService", "vs/platform/log/common/log", "vs/platform/layout/browser/layoutService"], function (require, exports, nls_1, extensions_1, clipboardService_1, clipboardService_2, notification_1, opener_1, functional_1, lifecycle_1, environmentService_1, log_1, layoutService_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$c4b = void 0;
    let $c4b = class $c4b extends clipboardService_2.$b4b {
        constructor(m, n, r, logService, layoutService) {
            super(layoutService, logService);
            this.m = m;
            this.n = n;
            this.r = r;
        }
        async readText(type) {
            if (type) {
                return super.readText(type);
            }
            try {
                return await navigator.clipboard.readText();
            }
            catch (error) {
                if (!!this.r.extensionTestsLocationURI) {
                    return ''; // do not ask for input in tests (https://github.com/microsoft/vscode/issues/112264)
                }
                return new Promise(resolve => {
                    // Inform user about permissions problem (https://github.com/microsoft/vscode/issues/112089)
                    const listener = new lifecycle_1.$jc();
                    const handle = this.m.prompt(notification_1.Severity.Error, (0, nls_1.localize)(0, null), [{
                            label: (0, nls_1.localize)(1, null),
                            run: async () => {
                                listener.dispose();
                                resolve(await this.readText(type));
                            }
                        }, {
                            label: (0, nls_1.localize)(2, null),
                            run: () => this.n.open('https://go.microsoft.com/fwlink/?linkid=2151362')
                        }], {
                        sticky: true
                    });
                    // Always resolve the promise once the notification closes
                    listener.add((0, functional_1.$bb)(handle.onDidClose)(() => resolve('')));
                });
            }
        }
    };
    exports.$c4b = $c4b;
    exports.$c4b = $c4b = __decorate([
        __param(0, notification_1.$Yu),
        __param(1, opener_1.$NT),
        __param(2, environmentService_1.$hJ),
        __param(3, log_1.$5i),
        __param(4, layoutService_1.$XT)
    ], $c4b);
    (0, extensions_1.$mr)(clipboardService_1.$UZ, $c4b, 1 /* InstantiationType.Delayed */);
});
//# sourceMappingURL=clipboardService.js.map