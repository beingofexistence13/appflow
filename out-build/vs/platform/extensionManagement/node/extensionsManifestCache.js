/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/lifecycle", "vs/platform/extensions/common/extensions", "vs/platform/files/common/files"], function (require, exports, lifecycle_1, extensions_1, files_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$wp = void 0;
    class $wp extends lifecycle_1.$kc {
        constructor(a, b, c, extensionsManagementService, f) {
            super();
            this.a = a;
            this.b = b;
            this.c = c;
            this.f = f;
            this.B(extensionsManagementService.onDidInstallExtensions(e => this.g(e)));
            this.B(extensionsManagementService.onDidUninstallExtension(e => this.h(e)));
        }
        g(results) {
            for (const r of results) {
                if (r.local) {
                    this.invalidate(r.profileLocation);
                }
            }
        }
        h(e) {
            if (!e.error) {
                this.invalidate(e.profileLocation);
            }
        }
        async invalidate(extensionsManifestLocation) {
            if (extensionsManifestLocation) {
                for (const profile of this.a.profiles) {
                    if (this.c.extUri.isEqual(profile.extensionsResource, extensionsManifestLocation)) {
                        await this.j(profile);
                    }
                }
            }
            else {
                await this.j(this.a.defaultProfile);
            }
        }
        async j(profile) {
            try {
                await this.b.del(this.c.extUri.joinPath(profile.cacheHome, extensions_1.$Pl));
            }
            catch (error) {
                if ((0, files_1.$jk)(error) !== 1 /* FileOperationResult.FILE_NOT_FOUND */) {
                    this.f.error(error);
                }
            }
        }
    }
    exports.$wp = $wp;
});
//# sourceMappingURL=extensionsManifestCache.js.map