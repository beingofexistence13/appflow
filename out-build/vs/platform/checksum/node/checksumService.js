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
define(["require", "exports", "crypto", "vs/base/common/stream", "vs/platform/files/common/files"], function (require, exports, crypto_1, stream_1, files_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$R7b = void 0;
    let $R7b = class $R7b {
        constructor(a) {
            this.a = a;
        }
        async checksum(resource) {
            const stream = (await this.a.readFileStream(resource)).value;
            return new Promise((resolve, reject) => {
                const hash = (0, crypto_1.createHash)('md5');
                (0, stream_1.$xd)(stream, {
                    onData: data => hash.update(data.buffer),
                    onError: error => reject(error),
                    onEnd: () => resolve(hash.digest('base64').replace(/=+$/, ''))
                });
            });
        }
    };
    exports.$R7b = $R7b;
    exports.$R7b = $R7b = __decorate([
        __param(0, files_1.$6j)
    ], $R7b);
});
//# sourceMappingURL=checksumService.js.map