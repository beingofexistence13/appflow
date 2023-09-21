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
define(["require", "exports", "vs/nls!vs/workbench/contrib/notebook/browser/services/notebookLoggingServiceImpl", "vs/base/common/lifecycle", "vs/platform/log/common/log"], function (require, exports, nls, lifecycle_1, log_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$pGb = void 0;
    const logChannelId = 'notebook.rendering';
    let $pGb = class $pGb extends lifecycle_1.$kc {
        static { this.ID = 'notebook'; }
        constructor(loggerService) {
            super();
            this.a = this.B(loggerService.createLogger(logChannelId, { name: nls.localize(0, null) }));
        }
        debug(category, output) {
            this.a.debug(`[${category}] ${output}`);
        }
        info(category, output) {
            this.a.info(`[${category}] ${output}`);
        }
    };
    exports.$pGb = $pGb;
    exports.$pGb = $pGb = __decorate([
        __param(0, log_1.$6i)
    ], $pGb);
});
//# sourceMappingURL=notebookLoggingServiceImpl.js.map