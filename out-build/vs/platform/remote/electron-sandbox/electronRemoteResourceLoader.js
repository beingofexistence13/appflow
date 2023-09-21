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
define(["require", "exports", "vs/base/common/buffer", "vs/base/common/lifecycle", "vs/base/common/mime", "vs/base/common/network", "vs/base/common/uri", "vs/platform/files/common/files", "vs/platform/ipc/common/mainProcessService", "vs/platform/remote/common/electronRemoteResources"], function (require, exports, buffer_1, lifecycle_1, mime_1, network_1, uri_1, files_1, mainProcessService_1, electronRemoteResources_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$I$b = void 0;
    let $I$b = class $I$b extends lifecycle_1.$kc {
        constructor(a, mainProcessService, b) {
            super();
            this.a = a;
            this.b = b;
            const channel = {
                listen(_, event) {
                    throw new Error(`Event not found: ${event}`);
                },
                call: (_, command, arg) => {
                    switch (command) {
                        case electronRemoteResources_1.$_6b: return this.c(uri_1.URI.revive(arg[0]));
                    }
                    throw new Error(`Call not found: ${command}`);
                }
            };
            mainProcessService.registerChannel(electronRemoteResources_1.$a7b, channel);
        }
        async c(uri) {
            let content;
            try {
                const params = new URLSearchParams(uri.query);
                const actual = uri.with({
                    scheme: params.get('scheme'),
                    authority: params.get('authority'),
                    query: '',
                });
                content = await this.b.readFile(actual);
            }
            catch (e) {
                const str = (0, buffer_1.$Zd)(buffer_1.$Fd.fromString(e.message));
                if (e instanceof files_1.$nk && e.fileOperationResult === 1 /* FileOperationResult.FILE_NOT_FOUND */) {
                    return { statusCode: 404, body: str };
                }
                else {
                    return { statusCode: 500, body: str };
                }
            }
            const mimeType = uri.path && (0, mime_1.$Ir)(uri.path);
            return { statusCode: 200, body: (0, buffer_1.$Zd)(content.value), mimeType };
        }
        getResourceUriProvider() {
            return (uri) => uri.with({
                scheme: network_1.Schemas.vscodeManagedRemoteResource,
                authority: `window:${this.a}`,
                query: new URLSearchParams({ authority: uri.authority, scheme: uri.scheme }).toString(),
            });
        }
    };
    exports.$I$b = $I$b;
    exports.$I$b = $I$b = __decorate([
        __param(1, mainProcessService_1.$o7b),
        __param(2, files_1.$6j)
    ], $I$b);
});
//# sourceMappingURL=electronRemoteResourceLoader.js.map