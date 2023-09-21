/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/network", "vs/base/common/resources", "vs/platform/instantiation/common/instantiation"], function (require, exports, network_1, resources_1, instantiation_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$9ac = exports.$8ac = void 0;
    class $8ac {
        constructor() {
            this.a = new Set(Object.keys(network_1.Schemas));
            this.b = new Map();
            this.extUri = new resources_1.$0f(uri => {
                const capabilities = this.b.get(uri.scheme);
                if (capabilities === undefined) {
                    // default: not ignore
                    return false;
                }
                if (capabilities & 1024 /* FileSystemProviderCapabilities.PathCaseSensitive */) {
                    // configured as case sensitive
                    return false;
                }
                return true;
            });
        }
        $acceptProviderInfos(uri, capabilities) {
            if (capabilities === null) {
                this.b.delete(uri.scheme);
            }
            else {
                this.b.set(uri.scheme, capabilities);
            }
        }
        isFreeScheme(scheme) {
            return !this.b.has(scheme) && !this.a.has(scheme);
        }
        getCapabilities(scheme) {
            return this.b.get(scheme);
        }
    }
    exports.$8ac = $8ac;
    exports.$9ac = (0, instantiation_1.$Bh)('IExtHostFileSystemInfo');
});
//# sourceMappingURL=extHostFileSystemInfo.js.map