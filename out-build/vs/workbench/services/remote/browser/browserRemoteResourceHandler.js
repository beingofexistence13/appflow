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
define(["require", "exports", "vs/base/common/buffer", "vs/base/common/lifecycle", "vs/base/common/mime", "vs/base/common/uri", "vs/platform/files/common/files"], function (require, exports, buffer_1, lifecycle_1, mime_1, uri_1, files_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$82b = void 0;
    let $82b = class $82b extends lifecycle_1.$kc {
        constructor(fileService, a) {
            super();
            this.a = a;
            this.B(a.onDidReceiveRequest(async (request) => {
                let uri;
                try {
                    uri = JSON.parse(decodeURIComponent(request.uri.query));
                }
                catch {
                    return request.respondWith(404, new Uint8Array(), {});
                }
                let content;
                try {
                    content = await fileService.readFile(uri_1.URI.from(uri, true));
                }
                catch (e) {
                    const str = buffer_1.$Fd.fromString(e.message).buffer;
                    if (e instanceof files_1.$nk && e.fileOperationResult === 1 /* FileOperationResult.FILE_NOT_FOUND */) {
                        return request.respondWith(404, str, {});
                    }
                    else {
                        return request.respondWith(500, str, {});
                    }
                }
                const mime = uri.path && (0, mime_1.$Ir)(uri.path);
                request.respondWith(200, content.value.buffer, mime ? { 'content-type': mime } : {});
            }));
        }
        getResourceUriProvider() {
            const baseUri = uri_1.URI.parse(document.location.href);
            return uri => baseUri.with({
                path: this.a.path,
                query: JSON.stringify(uri),
            });
        }
    };
    exports.$82b = $82b;
    exports.$82b = $82b = __decorate([
        __param(0, files_1.$6j)
    ], $82b);
});
//# sourceMappingURL=browserRemoteResourceHandler.js.map