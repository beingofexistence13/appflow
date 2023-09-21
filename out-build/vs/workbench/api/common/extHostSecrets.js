/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/platform/extensions/common/extensions", "vs/base/common/event"], function (require, exports, extensions_1, event_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$Kbc = void 0;
    class $Kbc {
        #secretState;
        constructor(extensionDescription, secretState) {
            this.b = new event_1.$fd();
            this.onDidChange = this.b.event;
            this.a = extensions_1.$Vl.toKey(extensionDescription.identifier);
            this.#secretState = secretState;
            this.#secretState.onDidChangePassword(e => {
                if (e.extensionId === this.a) {
                    this.b.fire({ key: e.key });
                }
            });
        }
        get(key) {
            return this.#secretState.get(this.a, key);
        }
        store(key, value) {
            return this.#secretState.store(this.a, key, value);
        }
        delete(key) {
            return this.#secretState.delete(this.a, key);
        }
    }
    exports.$Kbc = $Kbc;
});
//# sourceMappingURL=extHostSecrets.js.map