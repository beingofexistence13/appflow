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
define(["require", "exports", "vs/base/common/cancellation", "vs/base/common/network", "vs/platform/files/common/files", "vs/platform/request/common/request"], function (require, exports, cancellation_1, network_1, files_1, request_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$BN = void 0;
    let $BN = class $BN {
        constructor(a, b) {
            this.a = a;
            this.b = b;
        }
        async download(resource, target, cancellationToken = cancellation_1.CancellationToken.None) {
            if (resource.scheme === network_1.Schemas.file || resource.scheme === network_1.Schemas.vscodeRemote) {
                // Intentionally only support this for file|remote<->file|remote scenarios
                await this.b.copy(resource, target);
                return;
            }
            const options = { type: 'GET', url: resource.toString(true) };
            const context = await this.a.request(options, cancellationToken);
            if (context.res.statusCode === 200) {
                await this.b.writeFile(target, context.stream);
            }
            else {
                const message = await (0, request_1.$No)(context);
                throw new Error(`Expected 200, got back ${context.res.statusCode} instead.\n\n${message}`);
            }
        }
    };
    exports.$BN = $BN;
    exports.$BN = $BN = __decorate([
        __param(0, request_1.$Io),
        __param(1, files_1.$6j)
    ], $BN);
});
//# sourceMappingURL=downloadService.js.map