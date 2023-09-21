/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "./extHost.protocol", "vs/base/common/event", "vs/platform/instantiation/common/instantiation"], function (require, exports, extHost_protocol_1, event_1, instantiation_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$xbc = exports.$wbc = void 0;
    class $wbc {
        constructor(mainContext, c) {
            this.c = c;
            this.b = new event_1.$fd();
            this.onDidChangeStorage = this.b.event;
            this.a = mainContext.getProxy(extHost_protocol_1.$1J.MainThreadStorage);
        }
        registerExtensionStorageKeysToSync(extension, keys) {
            this.a.$registerExtensionStorageKeysToSync(extension, keys);
        }
        async initializeExtensionStorage(shared, key, defaultValue) {
            const value = await this.a.$initializeExtensionStorage(shared, key);
            let parsedValue;
            if (value) {
                parsedValue = this.d(shared, key, value);
            }
            return parsedValue || defaultValue;
        }
        setValue(shared, key, value) {
            return this.a.$setValue(shared, key, value);
        }
        $acceptValue(shared, key, value) {
            const parsedValue = this.d(shared, key, value);
            if (parsedValue) {
                this.b.fire({ shared, key, value: parsedValue });
            }
        }
        d(shared, key, value) {
            try {
                return JSON.parse(value);
            }
            catch (error) {
                // Do not fail this call but log it for diagnostics
                // https://github.com/microsoft/vscode/issues/132777
                this.c.error(`[extHostStorage] unexpected error parsing storage contents (extensionId: ${key}, global: ${shared}): ${error}`);
            }
            return undefined;
        }
    }
    exports.$wbc = $wbc;
    exports.$xbc = (0, instantiation_1.$Bh)('IExtHostStorage');
});
//# sourceMappingURL=extHostStorage.js.map