/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/workbench/api/common/extHost.protocol", "vs/workbench/api/common/extHostTypes"], function (require, exports, extHost_protocol_1, extHostTypes_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.ExtHostRelatedInformation = void 0;
    class ExtHostRelatedInformation {
        constructor(mainContext) {
            this._relatedInformationProviders = new Map();
            this._nextHandle = 0;
            this._proxy = mainContext.getProxy(extHost_protocol_1.MainContext.MainThreadAiRelatedInformation);
        }
        async $provideAiRelatedInformation(handle, query, token) {
            if (this._relatedInformationProviders.size === 0) {
                throw new Error('No related information providers registered');
            }
            const provider = this._relatedInformationProviders.get(handle);
            if (!provider) {
                throw new Error('related information provider not found');
            }
            const result = await provider.provideRelatedInformation(query, token) ?? [];
            return result;
        }
        getRelatedInformation(extension, query, types) {
            return this._proxy.$getAiRelatedInformation(query, types);
        }
        registerRelatedInformationProvider(extension, type, provider) {
            const handle = this._nextHandle;
            this._nextHandle++;
            this._relatedInformationProviders.set(handle, provider);
            this._proxy.$registerAiRelatedInformationProvider(handle, type);
            return new extHostTypes_1.Disposable(() => {
                this._proxy.$unregisterAiRelatedInformationProvider(handle);
                this._relatedInformationProviders.delete(handle);
            });
        }
    }
    exports.ExtHostRelatedInformation = ExtHostRelatedInformation;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZXh0SG9zdEFpUmVsYXRlZEluZm9ybWF0aW9uLmpzIiwic291cmNlUm9vdCI6ImZpbGU6Ly8vd29ya3NwYWNlL2FwcGZsb3cvc3JjLyIsInNvdXJjZXMiOlsidnMvd29ya2JlbmNoL2FwaS9jb21tb24vZXh0SG9zdEFpUmVsYXRlZEluZm9ybWF0aW9uLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Z0dBR2dHOzs7OztJQU9oRyxNQUFhLHlCQUF5QjtRQU1yQyxZQUFZLFdBQXlCO1lBTDdCLGlDQUE0QixHQUE0QyxJQUFJLEdBQUcsRUFBRSxDQUFDO1lBQ2xGLGdCQUFXLEdBQUcsQ0FBQyxDQUFDO1lBS3ZCLElBQUksQ0FBQyxNQUFNLEdBQUcsV0FBVyxDQUFDLFFBQVEsQ0FBQyw4QkFBVyxDQUFDLDhCQUE4QixDQUFDLENBQUM7UUFDaEYsQ0FBQztRQUVELEtBQUssQ0FBQyw0QkFBNEIsQ0FBQyxNQUFjLEVBQUUsS0FBYSxFQUFFLEtBQXdCO1lBQ3pGLElBQUksSUFBSSxDQUFDLDRCQUE0QixDQUFDLElBQUksS0FBSyxDQUFDLEVBQUU7Z0JBQ2pELE1BQU0sSUFBSSxLQUFLLENBQUMsNkNBQTZDLENBQUMsQ0FBQzthQUMvRDtZQUVELE1BQU0sUUFBUSxHQUFHLElBQUksQ0FBQyw0QkFBNEIsQ0FBQyxHQUFHLENBQUMsTUFBTSxDQUFDLENBQUM7WUFDL0QsSUFBSSxDQUFDLFFBQVEsRUFBRTtnQkFDZCxNQUFNLElBQUksS0FBSyxDQUFDLHdDQUF3QyxDQUFDLENBQUM7YUFDMUQ7WUFFRCxNQUFNLE1BQU0sR0FBRyxNQUFNLFFBQVEsQ0FBQyx5QkFBeUIsQ0FBQyxLQUFLLEVBQUUsS0FBSyxDQUFDLElBQUksRUFBRSxDQUFDO1lBQzVFLE9BQU8sTUFBTSxDQUFDO1FBQ2YsQ0FBQztRQUVELHFCQUFxQixDQUFDLFNBQWdDLEVBQUUsS0FBYSxFQUFFLEtBQStCO1lBQ3JHLE9BQU8sSUFBSSxDQUFDLE1BQU0sQ0FBQyx3QkFBd0IsQ0FBQyxLQUFLLEVBQUUsS0FBSyxDQUFDLENBQUM7UUFDM0QsQ0FBQztRQUVELGtDQUFrQyxDQUFDLFNBQWdDLEVBQUUsSUFBNEIsRUFBRSxRQUFvQztZQUN0SSxNQUFNLE1BQU0sR0FBRyxJQUFJLENBQUMsV0FBVyxDQUFDO1lBQ2hDLElBQUksQ0FBQyxXQUFXLEVBQUUsQ0FBQztZQUNuQixJQUFJLENBQUMsNEJBQTRCLENBQUMsR0FBRyxDQUFDLE1BQU0sRUFBRSxRQUFRLENBQUMsQ0FBQztZQUN4RCxJQUFJLENBQUMsTUFBTSxDQUFDLHFDQUFxQyxDQUFDLE1BQU0sRUFBRSxJQUFJLENBQUMsQ0FBQztZQUNoRSxPQUFPLElBQUkseUJBQVUsQ0FBQyxHQUFHLEVBQUU7Z0JBQzFCLElBQUksQ0FBQyxNQUFNLENBQUMsdUNBQXVDLENBQUMsTUFBTSxDQUFDLENBQUM7Z0JBQzVELElBQUksQ0FBQyw0QkFBNEIsQ0FBQyxNQUFNLENBQUMsTUFBTSxDQUFDLENBQUM7WUFDbEQsQ0FBQyxDQUFDLENBQUM7UUFDSixDQUFDO0tBQ0Q7SUF0Q0QsOERBc0NDIn0=