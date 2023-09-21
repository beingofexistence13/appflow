/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/workbench/api/common/extHost.protocol", "vs/workbench/api/common/extHostTypes"], function (require, exports, extHost_protocol_1, extHostTypes_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$0cc = void 0;
    class $0cc {
        constructor(mainContext) {
            this.a = new Map();
            this.b = 0;
            this.c = mainContext.getProxy(extHost_protocol_1.$1J.MainThreadAiRelatedInformation);
        }
        async $provideAiRelatedInformation(handle, query, token) {
            if (this.a.size === 0) {
                throw new Error('No related information providers registered');
            }
            const provider = this.a.get(handle);
            if (!provider) {
                throw new Error('related information provider not found');
            }
            const result = await provider.provideRelatedInformation(query, token) ?? [];
            return result;
        }
        getRelatedInformation(extension, query, types) {
            return this.c.$getAiRelatedInformation(query, types);
        }
        registerRelatedInformationProvider(extension, type, provider) {
            const handle = this.b;
            this.b++;
            this.a.set(handle, provider);
            this.c.$registerAiRelatedInformationProvider(handle, type);
            return new extHostTypes_1.$3J(() => {
                this.c.$unregisterAiRelatedInformationProvider(handle);
                this.a.delete(handle);
            });
        }
    }
    exports.$0cc = $0cc;
});
//# sourceMappingURL=extHostAiRelatedInformation.js.map