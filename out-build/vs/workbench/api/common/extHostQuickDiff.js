/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/uri", "vs/workbench/api/common/extHost.protocol", "vs/base/common/async", "vs/workbench/api/common/extHostTypeConverters"], function (require, exports, uri_1, extHost_protocol_1, async_1, extHostTypeConverters_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$1cc = void 0;
    class $1cc {
        static { this.a = 0; }
        constructor(mainContext, d) {
            this.d = d;
            this.c = new Map();
            this.b = mainContext.getProxy(extHost_protocol_1.$1J.MainThreadQuickDiff);
        }
        $provideOriginalResource(handle, uriComponents, token) {
            const uri = uri_1.URI.revive(uriComponents);
            const provider = this.c.get(handle);
            if (!provider) {
                return Promise.resolve(null);
            }
            return (0, async_1.$zg)(() => provider.provideOriginalResource(uri, token))
                .then(r => r || null);
        }
        registerQuickDiffProvider(selector, quickDiffProvider, label, rootUri) {
            const handle = $1cc.a++;
            this.c.set(handle, quickDiffProvider);
            this.b.$registerQuickDiffProvider(handle, extHostTypeConverters_1.DocumentSelector.from(selector, this.d), label, rootUri);
            return {
                dispose: () => {
                    this.b.$unregisterQuickDiffProvider(handle);
                    this.c.delete(handle);
                }
            };
        }
    }
    exports.$1cc = $1cc;
});
//# sourceMappingURL=extHostQuickDiff.js.map