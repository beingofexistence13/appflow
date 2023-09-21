/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/workbench/api/common/extHost.protocol", "vs/workbench/api/common/extHostTypeConverters", "vs/base/common/uri"], function (require, exports, extHost_protocol_1, extHostTypeConverters_1, uri_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$6cc = void 0;
    class $6cc {
        static { this.a = 0; }
        constructor(mainContext, d) {
            this.d = d;
            this.c = new Map();
            this.b = mainContext.getProxy(extHost_protocol_1.$1J.MainThreadShare);
        }
        async $provideShare(handle, shareableItem, token) {
            const provider = this.c.get(handle);
            const result = await provider?.provideShare({ selection: extHostTypeConverters_1.Range.to(shareableItem.selection), resourceUri: uri_1.URI.revive(shareableItem.resourceUri) }, token);
            return result ?? undefined;
        }
        registerShareProvider(selector, provider) {
            const handle = $6cc.a++;
            this.c.set(handle, provider);
            this.b.$registerShareProvider(handle, extHostTypeConverters_1.DocumentSelector.from(selector, this.d), provider.id, provider.label, provider.priority);
            return {
                dispose: () => {
                    this.b.$unregisterShareProvider(handle);
                    this.c.delete(handle);
                }
            };
        }
    }
    exports.$6cc = $6cc;
});
//# sourceMappingURL=extHostShare.js.map