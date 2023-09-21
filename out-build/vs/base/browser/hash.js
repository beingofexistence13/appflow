/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/buffer", "vs/base/common/hash"], function (require, exports, buffer_1, hash_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$1Q = void 0;
    async function $1Q(str) {
        // Prefer to use browser's crypto module
        if (globalThis?.crypto?.subtle) {
            // Careful to use `dontUseNodeBuffer` when passing the
            // buffer to the browser `crypto` API. Users reported
            // native crashes in certain cases that we could trace
            // back to passing node.js `Buffer` around
            // (https://github.com/microsoft/vscode/issues/114227)
            const buffer = buffer_1.$Fd.fromString(str, { dontUseNodeBuffer: true }).buffer;
            const hash = await globalThis.crypto.subtle.digest({ name: 'sha-1' }, buffer);
            return (0, hash_1.$ui)(hash);
        }
        // Otherwise fallback to `StringSHA1`
        else {
            const computer = new hash_1.$vi();
            computer.update(str);
            return computer.digest();
        }
    }
    exports.$1Q = $1Q;
});
//# sourceMappingURL=hash.js.map