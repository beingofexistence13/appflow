/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/lifecycle", "vs/workbench/api/common/extHost.protocol", "vs/base/common/errors", "vs/workbench/api/common/extHostTypeConverters"], function (require, exports, lifecycle_1, extHost_protocol_1, errors_1, extHostTypeConverters_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$9cc = void 0;
    class $9cc {
        static { this.a = 0; }
        constructor(mainContext) {
            this.b = new Map();
            this.c = mainContext.getProxy(extHost_protocol_1.$1J.MainThreadChatVariables);
        }
        async $resolveVariable(handle, messageText, token) {
            const item = this.b.get(handle);
            if (!item) {
                return undefined;
            }
            try {
                const value = await item.resolver.resolve(item.data.name, { message: messageText }, token);
                if (value) {
                    return value.map(extHostTypeConverters_1.ChatVariable.from);
                }
            }
            catch (err) {
                (0, errors_1.$Z)(err);
            }
            return undefined;
        }
        registerVariableResolver(extension, name, description, resolver) {
            const handle = $9cc.a++;
            this.b.set(handle, { extension: extension.identifier, data: { name, description }, resolver: resolver });
            this.c.$registerVariable(handle, { name, description });
            return (0, lifecycle_1.$ic)(() => {
                this.b.delete(handle);
                this.c.$unregisterVariable(handle);
            });
        }
    }
    exports.$9cc = $9cc;
});
//# sourceMappingURL=extHostChatVariables.js.map