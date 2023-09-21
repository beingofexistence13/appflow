/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/lifecycle", "vs/base/common/network", "vs/base/common/uri", "./extHost.protocol"], function (require, exports, lifecycle_1, network_1, uri_1, extHost_protocol_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$Scc = void 0;
    class $Scc {
        static { this.a = new Set([network_1.Schemas.http, network_1.Schemas.https]); }
        constructor(mainContext) {
            this.c = new Map();
            this.b = mainContext.getProxy(extHost_protocol_1.$1J.MainThreadUriOpeners);
        }
        registerExternalUriOpener(extensionId, id, opener, metadata) {
            if (this.c.has(id)) {
                throw new Error(`Opener with id '${id}' already registered`);
            }
            const invalidScheme = metadata.schemes.find(scheme => !$Scc.a.has(scheme));
            if (invalidScheme) {
                throw new Error(`Scheme '${invalidScheme}' is not supported. Only http and https are currently supported.`);
            }
            this.c.set(id, opener);
            this.b.$registerUriOpener(id, metadata.schemes, extensionId, metadata.label);
            return (0, lifecycle_1.$ic)(() => {
                this.c.delete(id);
                this.b.$unregisterUriOpener(id);
            });
        }
        async $canOpenUri(id, uriComponents, token) {
            const opener = this.c.get(id);
            if (!opener) {
                throw new Error(`Unknown opener with id: ${id}`);
            }
            const uri = uri_1.URI.revive(uriComponents);
            return opener.canOpenExternalUri(uri, token);
        }
        async $openUri(id, context, token) {
            const opener = this.c.get(id);
            if (!opener) {
                throw new Error(`Unknown opener id: '${id}'`);
            }
            return opener.openExternalUri(uri_1.URI.revive(context.resolvedUri), {
                sourceUri: uri_1.URI.revive(context.sourceUri)
            }, token);
        }
    }
    exports.$Scc = $Scc;
});
//# sourceMappingURL=extHostUriOpener.js.map