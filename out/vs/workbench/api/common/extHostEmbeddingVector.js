/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/workbench/api/common/extHost.protocol", "vs/workbench/api/common/extHostTypes"], function (require, exports, extHost_protocol_1, extHostTypes_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.ExtHostAiEmbeddingVector = void 0;
    class ExtHostAiEmbeddingVector {
        constructor(mainContext) {
            this._AiEmbeddingVectorProviders = new Map();
            this._nextHandle = 0;
            this._proxy = mainContext.getProxy(extHost_protocol_1.MainContext.MainThreadAiEmbeddingVector);
        }
        async $provideAiEmbeddingVector(handle, strings, token) {
            if (this._AiEmbeddingVectorProviders.size === 0) {
                throw new Error('No embedding vector providers registered');
            }
            const provider = this._AiEmbeddingVectorProviders.get(handle);
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
            const handle = this._nextHandle;
            this._nextHandle++;
            this._AiEmbeddingVectorProviders.set(handle, provider);
            this._proxy.$registerAiEmbeddingVectorProvider(model, handle);
            return new extHostTypes_1.Disposable(() => {
                this._proxy.$unregisterAiEmbeddingVectorProvider(handle);
                this._AiEmbeddingVectorProviders.delete(handle);
            });
        }
    }
    exports.ExtHostAiEmbeddingVector = ExtHostAiEmbeddingVector;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZXh0SG9zdEVtYmVkZGluZ1ZlY3Rvci5qcyIsInNvdXJjZVJvb3QiOiJmaWxlOi8vL3dvcmtzcGFjZS9hcHBmbG93L3NyYy8iLCJzb3VyY2VzIjpbInZzL3dvcmtiZW5jaC9hcGkvY29tbW9uL2V4dEhvc3RFbWJlZGRpbmdWZWN0b3IudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7O0lBT2hHLE1BQWEsd0JBQXdCO1FBTXBDLFlBQ0MsV0FBeUI7WUFObEIsZ0NBQTJCLEdBQXlDLElBQUksR0FBRyxFQUFFLENBQUM7WUFDOUUsZ0JBQVcsR0FBRyxDQUFDLENBQUM7WUFPdkIsSUFBSSxDQUFDLE1BQU0sR0FBRyxXQUFXLENBQUMsUUFBUSxDQUFDLDhCQUFXLENBQUMsMkJBQTJCLENBQUMsQ0FBQztRQUM3RSxDQUFDO1FBRUQsS0FBSyxDQUFDLHlCQUF5QixDQUFDLE1BQWMsRUFBRSxPQUFpQixFQUFFLEtBQXdCO1lBQzFGLElBQUksSUFBSSxDQUFDLDJCQUEyQixDQUFDLElBQUksS0FBSyxDQUFDLEVBQUU7Z0JBQ2hELE1BQU0sSUFBSSxLQUFLLENBQUMsMENBQTBDLENBQUMsQ0FBQzthQUM1RDtZQUVELE1BQU0sUUFBUSxHQUFHLElBQUksQ0FBQywyQkFBMkIsQ0FBQyxHQUFHLENBQUMsTUFBTSxDQUFDLENBQUM7WUFDOUQsSUFBSSxDQUFDLFFBQVEsRUFBRTtnQkFDZCxNQUFNLElBQUksS0FBSyxDQUFDLHFDQUFxQyxDQUFDLENBQUM7YUFDdkQ7WUFFRCxNQUFNLE1BQU0sR0FBRyxNQUFNLFFBQVEsQ0FBQyxzQkFBc0IsQ0FBQyxPQUFPLEVBQUUsS0FBSyxDQUFDLENBQUM7WUFDckUsSUFBSSxDQUFDLE1BQU0sRUFBRTtnQkFDWixNQUFNLElBQUksS0FBSyxDQUFDLDhDQUE4QyxDQUFDLENBQUM7YUFDaEU7WUFDRCxPQUFPLE1BQU0sQ0FBQztRQUNmLENBQUM7UUFFRCwrQkFBK0IsQ0FBQyxTQUFnQyxFQUFFLEtBQWEsRUFBRSxRQUFpQztZQUNqSCxNQUFNLE1BQU0sR0FBRyxJQUFJLENBQUMsV0FBVyxDQUFDO1lBQ2hDLElBQUksQ0FBQyxXQUFXLEVBQUUsQ0FBQztZQUNuQixJQUFJLENBQUMsMkJBQTJCLENBQUMsR0FBRyxDQUFDLE1BQU0sRUFBRSxRQUFRLENBQUMsQ0FBQztZQUN2RCxJQUFJLENBQUMsTUFBTSxDQUFDLGtDQUFrQyxDQUFDLEtBQUssRUFBRSxNQUFNLENBQUMsQ0FBQztZQUM5RCxPQUFPLElBQUkseUJBQVUsQ0FBQyxHQUFHLEVBQUU7Z0JBQzFCLElBQUksQ0FBQyxNQUFNLENBQUMsb0NBQW9DLENBQUMsTUFBTSxDQUFDLENBQUM7Z0JBQ3pELElBQUksQ0FBQywyQkFBMkIsQ0FBQyxNQUFNLENBQUMsTUFBTSxDQUFDLENBQUM7WUFDakQsQ0FBQyxDQUFDLENBQUM7UUFDSixDQUFDO0tBQ0Q7SUF2Q0QsNERBdUNDIn0=