/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/platform/instantiation/common/extensions", "vs/platform/workspace/common/canonicalUri"], function (require, exports, extensions_1, canonicalUri_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$oyb = void 0;
    class $oyb {
        constructor() {
            this.a = new Map();
        }
        registerCanonicalUriProvider(provider) {
            this.a.set(provider.scheme, provider);
            return {
                dispose: () => this.a.delete(provider.scheme)
            };
        }
        async provideCanonicalUri(uri, targetScheme, token) {
            const provider = this.a.get(uri.scheme);
            if (provider) {
                return provider.provideCanonicalUri(uri, targetScheme, token);
            }
            return undefined;
        }
    }
    exports.$oyb = $oyb;
    (0, extensions_1.$mr)(canonicalUri_1.$Blb, $oyb, 1 /* InstantiationType.Delayed */);
});
//# sourceMappingURL=canonicalUriService.js.map