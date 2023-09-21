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
define(["require", "exports", "vs/workbench/api/common/extHost.protocol", "../../services/extensions/common/extHostCustomers", "vs/platform/url/common/url", "vs/workbench/services/extensions/browser/extensionUrlHandler", "vs/platform/extensions/common/extensions"], function (require, exports, extHost_protocol_1, extHostCustomers_1, url_1, extensionUrlHandler_1, extensions_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$$kb = void 0;
    class ExtensionUrlHandler {
        constructor(a, b, extensionId, extensionDisplayName) {
            this.a = a;
            this.b = b;
            this.extensionId = extensionId;
            this.extensionDisplayName = extensionDisplayName;
        }
        handleURL(uri, options) {
            if (!extensions_1.$Vl.equals(this.extensionId, uri.authority)) {
                return Promise.resolve(false);
            }
            return Promise.resolve(this.a.$handleExternalUri(this.b, uri)).then(() => true);
        }
    }
    let $$kb = class $$kb {
        constructor(context, c, d) {
            this.c = c;
            this.d = d;
            this.b = new Map();
            this.a = context.getProxy(extHost_protocol_1.$2J.ExtHostUrls);
        }
        $registerUriHandler(handle, extensionId, extensionDisplayName) {
            const handler = new ExtensionUrlHandler(this.a, handle, extensionId, extensionDisplayName);
            const disposable = this.c.registerHandler(handler);
            this.b.set(handle, { extensionId, disposable });
            this.d.registerExtensionHandler(extensionId, handler);
            return Promise.resolve(undefined);
        }
        $unregisterUriHandler(handle) {
            const tuple = this.b.get(handle);
            if (!tuple) {
                return Promise.resolve(undefined);
            }
            const { extensionId, disposable } = tuple;
            this.d.unregisterExtensionHandler(extensionId);
            this.b.delete(handle);
            disposable.dispose();
            return Promise.resolve(undefined);
        }
        async $createAppUri(uri) {
            return this.c.create(uri);
        }
        dispose() {
            this.b.forEach(({ disposable }) => disposable.dispose());
            this.b.clear();
        }
    };
    exports.$$kb = $$kb;
    exports.$$kb = $$kb = __decorate([
        (0, extHostCustomers_1.$jbb)(extHost_protocol_1.$1J.MainThreadUrls),
        __param(1, url_1.$IT),
        __param(2, extensionUrlHandler_1.$0kb)
    ], $$kb);
});
//# sourceMappingURL=mainThreadUrls.js.map