/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/workbench/api/common/extHost.protocol", "vs/workbench/api/common/extHostTypes"], function (require, exports, extHost_protocol_1, extHostTypes_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$$cc = void 0;
    class $$cc {
        constructor(mainContext) {
            this.a = new Map();
            this.b = 0;
            this.c = mainContext.getProxy(extHost_protocol_1.$1J.MainThreadAiEmbeddingVector);
        }
        async $provideAiEmbeddingVector(handle, strings, token) {
            if (this.a.size === 0) {
                throw new Error('No embedding vector providers registered');
            }
            const provider = this.a.get(handle);
            if (!provider) {
                throw new Error('Embedding vector provider not found');
            }
            const result = await provider.provideEmbeddingVector(strings, token);
            if (!result) {
                throw new Error('Embedding vector provider returned undefined');
            }
            return result;
        }
        registerEmbeddingVectorProvider(extension, model, provider) {
            const handle = this.b;
            this.b++;
            this.a.set(handle, provider);
            this.c.$registerAiEmbeddingVectorProvider(model, handle);
            return new extHostTypes_1.$3J(() => {
                this.c.$unregisterAiEmbeddingVectorProvider(handle);
                this.a.delete(handle);
            });
        }
    }
    exports.$$cc = $$cc;
});
//# sourceMappingURL=extHostEmbeddingVector.js.map