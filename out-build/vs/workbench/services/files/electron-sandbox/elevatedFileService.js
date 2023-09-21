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
define(["require", "exports", "vs/base/common/extpath", "vs/base/common/network", "vs/base/common/uri", "vs/platform/files/common/files", "vs/platform/instantiation/common/extensions", "vs/platform/native/common/native", "vs/workbench/services/environment/electron-sandbox/environmentService", "vs/workbench/services/files/common/elevatedFileService"], function (require, exports, extpath_1, network_1, uri_1, files_1, extensions_1, native_1, environmentService_1, elevatedFileService_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$9_b = void 0;
    let $9_b = class $9_b {
        constructor(a, b, c) {
            this.a = a;
            this.b = b;
            this.c = c;
        }
        isSupported(resource) {
            // Saving elevated is currently only supported for local
            // files for as long as we have no generic support from
            // the file service
            // (https://github.com/microsoft/vscode/issues/48659)
            return resource.scheme === network_1.Schemas.file;
        }
        async writeFileElevated(resource, value, options) {
            const source = uri_1.URI.file((0, extpath_1.$Qf)(this.c.userDataPath, 'code-elevated'));
            try {
                // write into a tmp file first
                await this.b.writeFile(source, value, options);
                // then sudo prompt copy
                await this.a.writeElevated(source, resource, options);
            }
            finally {
                // clean up
                await this.b.del(source);
            }
            return this.b.resolve(resource, { resolveMetadata: true });
        }
    };
    exports.$9_b = $9_b;
    exports.$9_b = $9_b = __decorate([
        __param(0, native_1.$05b),
        __param(1, files_1.$6j),
        __param(2, environmentService_1.$1$b)
    ], $9_b);
    (0, extensions_1.$mr)(elevatedFileService_1.$CD, $9_b, 1 /* InstantiationType.Delayed */);
});
//# sourceMappingURL=elevatedFileService.js.map