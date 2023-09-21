/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "./extHost.protocol", "vs/base/common/uri", "vs/base/common/lifecycle", "vs/base/common/errors", "vs/platform/extensions/common/extensions"], function (require, exports, extHost_protocol_1, uri_1, lifecycle_1, errors_1, extensions_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$9bc = void 0;
    class $9bc {
        static { this.a = 0; }
        constructor(mainContext) {
            this.c = new extensions_1.$Wl();
            this.d = new Map();
            this.b = mainContext.getProxy(extHost_protocol_1.$1J.MainThreadUrls);
        }
        registerUriHandler(extension, handler) {
            const extensionId = extension.identifier;
            if (this.c.has(extensionId)) {
                throw new Error(`Protocol handler already registered for extension ${extensionId}`);
            }
            const handle = $9bc.a++;
            this.c.add(extensionId);
            this.d.set(handle, handler);
            this.b.$registerUriHandler(handle, extensionId, extension.displayName || extension.name);
            return (0, lifecycle_1.$ic)(() => {
                this.c.delete(extensionId);
                this.d.delete(handle);
                this.b.$unregisterUriHandler(handle);
            });
        }
        $handleExternalUri(handle, uri) {
            const handler = this.d.get(handle);
            if (!handler) {
                return Promise.resolve(undefined);
            }
            try {
                handler.handleUri(uri_1.URI.revive(uri));
            }
            catch (err) {
                (0, errors_1.$Y)(err);
            }
            return Promise.resolve(undefined);
        }
        async createAppUri(uri) {
            return uri_1.URI.revive(await this.b.$createAppUri(uri));
        }
    }
    exports.$9bc = $9bc;
});
//# sourceMappingURL=extHostUrls.js.map