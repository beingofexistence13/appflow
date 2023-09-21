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
define(["require", "exports", "vs/workbench/services/extensions/common/extensions", "vs/platform/progress/common/progress", "vs/nls!vs/workbench/contrib/extensions/browser/extensionsActivationProgress", "vs/base/common/async", "vs/platform/log/common/log", "vs/base/common/cancellation"], function (require, exports, extensions_1, progress_1, nls_1, async_1, log_1, cancellation_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$LUb = void 0;
    let $LUb = class $LUb {
        constructor(extensionService, progressService, logService) {
            const options = {
                location: 10 /* ProgressLocation.Window */,
                title: (0, nls_1.localize)(0, null)
            };
            let deferred;
            let count = 0;
            this.a = extensionService.onWillActivateByEvent(e => {
                logService.trace('onWillActivateByEvent: ', e.event);
                if (!deferred) {
                    deferred = new async_1.$2g();
                    progressService.withProgress(options, _ => deferred.p);
                }
                count++;
                Promise.race([e.activation, (0, async_1.$Hg)(5000, cancellation_1.CancellationToken.None)]).finally(() => {
                    if (--count === 0) {
                        deferred.complete(undefined);
                        deferred = undefined;
                    }
                });
            });
        }
        dispose() {
            this.a.dispose();
        }
    };
    exports.$LUb = $LUb;
    exports.$LUb = $LUb = __decorate([
        __param(0, extensions_1.$MF),
        __param(1, progress_1.$2u),
        __param(2, log_1.$5i)
    ], $LUb);
});
//# sourceMappingURL=extensionsActivationProgress.js.map