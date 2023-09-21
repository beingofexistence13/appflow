/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/lifecycle", "vs/base/common/types", "vs/base/common/uri", "vs/workbench/services/extensions/common/extensions", "./extHost.protocol"], function (require, exports, lifecycle_1, types_1, uri_1, extensions_1, extHost_protocol_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$Zcc = void 0;
    class $Zcc {
        constructor(mainContext) {
            this.b = new Map();
            this.a = mainContext.getProxy(extHost_protocol_1.$1J.MainThreadProfileContentHandlers);
        }
        registrProfileContentHandler(extension, id, handler) {
            (0, extensions_1.$QF)(extension, 'profileContentHandlers');
            if (this.b.has(id)) {
                throw new Error(`Handler with id '${id}' already registered`);
            }
            this.b.set(id, handler);
            this.a.$registerProfileContentHandler(id, handler.name, handler.description, extension.identifier.value);
            return (0, lifecycle_1.$ic)(() => {
                this.b.delete(id);
                this.a.$unregisterProfileContentHandler(id);
            });
        }
        async $saveProfile(id, name, content, token) {
            const handler = this.b.get(id);
            if (!handler) {
                throw new Error(`Unknown handler with id: ${id}`);
            }
            return handler.saveProfile(name, content, token);
        }
        async $readProfile(id, idOrUri, token) {
            const handler = this.b.get(id);
            if (!handler) {
                throw new Error(`Unknown handler with id: ${id}`);
            }
            return handler.readProfile((0, types_1.$jf)(idOrUri) ? idOrUri : uri_1.URI.revive(idOrUri), token);
        }
    }
    exports.$Zcc = $Zcc;
});
//# sourceMappingURL=extHostProfileContentHandler.js.map