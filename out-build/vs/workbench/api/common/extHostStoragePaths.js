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
define(["require", "exports", "vs/platform/instantiation/common/instantiation", "vs/workbench/api/common/extHostInitDataService", "vs/platform/log/common/log", "vs/workbench/api/common/extHostFileSystemConsumer", "vs/base/common/uri"], function (require, exports, instantiation_1, extHostInitDataService_1, log_1, extHostFileSystemConsumer_1, uri_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$Dbc = exports.$Cbc = void 0;
    exports.$Cbc = (0, instantiation_1.$Bh)('IExtensionStoragePaths');
    let $Dbc = class $Dbc {
        constructor(initData, d, f) {
            this.d = d;
            this.f = f;
            this.a = initData.workspace ?? undefined;
            this.b = initData.environment;
            this.whenReady = this.h().then(value => this.c = value);
        }
        async g(storageName) {
            return uri_1.URI.joinPath(this.b.workspaceStorageHome, storageName);
        }
        async h() {
            if (!this.a) {
                return Promise.resolve(undefined);
            }
            const storageName = this.a.id;
            const storageUri = await this.g(storageName);
            try {
                await this.f.value.stat(storageUri);
                this.d.trace('[ExtHostStorage] storage dir already exists', storageUri);
                return storageUri;
            }
            catch {
                // doesn't exist, that's OK
            }
            try {
                this.d.trace('[ExtHostStorage] creating dir and metadata-file', storageUri);
                await this.f.value.createDirectory(storageUri);
                await this.f.value.writeFile(uri_1.URI.joinPath(storageUri, 'meta.json'), new TextEncoder().encode(JSON.stringify({
                    id: this.a.id,
                    configuration: uri_1.URI.revive(this.a.configuration)?.toString(),
                    name: this.a.name
                }, undefined, 2)));
                return storageUri;
            }
            catch (e) {
                this.d.error('[ExtHostStorage]', e);
                return undefined;
            }
        }
        workspaceValue(extension) {
            if (this.c) {
                return uri_1.URI.joinPath(this.c, extension.identifier.value);
            }
            return undefined;
        }
        globalValue(extension) {
            return uri_1.URI.joinPath(this.b.globalStorageHome, extension.identifier.value.toLowerCase());
        }
        onWillDeactivateAll() {
        }
    };
    exports.$Dbc = $Dbc;
    exports.$Dbc = $Dbc = __decorate([
        __param(0, extHostInitDataService_1.$fM),
        __param(1, log_1.$5i),
        __param(2, extHostFileSystemConsumer_1.$Bbc)
    ], $Dbc);
});
//# sourceMappingURL=extHostStoragePaths.js.map