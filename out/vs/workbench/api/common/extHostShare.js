/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/workbench/api/common/extHost.protocol", "vs/workbench/api/common/extHostTypeConverters", "vs/base/common/uri"], function (require, exports, extHost_protocol_1, extHostTypeConverters_1, uri_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.ExtHostShare = void 0;
    class ExtHostShare {
        static { this.handlePool = 0; }
        constructor(mainContext, uriTransformer) {
            this.uriTransformer = uriTransformer;
            this.providers = new Map();
            this.proxy = mainContext.getProxy(extHost_protocol_1.MainContext.MainThreadShare);
        }
        async $provideShare(handle, shareableItem, token) {
            const provider = this.providers.get(handle);
            const result = await provider?.provideShare({ selection: extHostTypeConverters_1.Range.to(shareableItem.selection), resourceUri: uri_1.URI.revive(shareableItem.resourceUri) }, token);
            return result ?? undefined;
        }
        registerShareProvider(selector, provider) {
            const handle = ExtHostShare.handlePool++;
            this.providers.set(handle, provider);
            this.proxy.$registerShareProvider(handle, extHostTypeConverters_1.DocumentSelector.from(selector, this.uriTransformer), provider.id, provider.label, provider.priority);
            return {
                dispose: () => {
                    this.proxy.$unregisterShareProvider(handle);
                    this.providers.delete(handle);
                }
            };
        }
    }
    exports.ExtHostShare = ExtHostShare;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZXh0SG9zdFNoYXJlLmpzIiwic291cmNlUm9vdCI6ImZpbGU6Ly8vd29ya3NwYWNlL2FwcGZsb3cvc3JjLyIsInNvdXJjZXMiOlsidnMvd29ya2JlbmNoL2FwaS9jb21tb24vZXh0SG9zdFNoYXJlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Z0dBR2dHOzs7OztJQVNoRyxNQUFhLFlBQVk7aUJBQ1QsZUFBVSxHQUFXLENBQUMsQUFBWixDQUFhO1FBS3RDLFlBQ0MsV0FBeUIsRUFDUixjQUEyQztZQUEzQyxtQkFBYyxHQUFkLGNBQWMsQ0FBNkI7WUFKckQsY0FBUyxHQUFzQyxJQUFJLEdBQUcsRUFBRSxDQUFDO1lBTWhFLElBQUksQ0FBQyxLQUFLLEdBQUcsV0FBVyxDQUFDLFFBQVEsQ0FBQyw4QkFBVyxDQUFDLGVBQWUsQ0FBQyxDQUFDO1FBQ2hFLENBQUM7UUFFRCxLQUFLLENBQUMsYUFBYSxDQUFDLE1BQWMsRUFBRSxhQUFnQyxFQUFFLEtBQXdCO1lBQzdGLE1BQU0sUUFBUSxHQUFHLElBQUksQ0FBQyxTQUFTLENBQUMsR0FBRyxDQUFDLE1BQU0sQ0FBQyxDQUFDO1lBQzVDLE1BQU0sTUFBTSxHQUFHLE1BQU0sUUFBUSxFQUFFLFlBQVksQ0FBQyxFQUFFLFNBQVMsRUFBRSw2QkFBSyxDQUFDLEVBQUUsQ0FBQyxhQUFhLENBQUMsU0FBUyxDQUFDLEVBQUUsV0FBVyxFQUFFLFNBQUcsQ0FBQyxNQUFNLENBQUMsYUFBYSxDQUFDLFdBQVcsQ0FBQyxFQUFFLEVBQUUsS0FBSyxDQUFDLENBQUM7WUFDekosT0FBTyxNQUFNLElBQUksU0FBUyxDQUFDO1FBQzVCLENBQUM7UUFFRCxxQkFBcUIsQ0FBQyxRQUFpQyxFQUFFLFFBQThCO1lBQ3RGLE1BQU0sTUFBTSxHQUFHLFlBQVksQ0FBQyxVQUFVLEVBQUUsQ0FBQztZQUN6QyxJQUFJLENBQUMsU0FBUyxDQUFDLEdBQUcsQ0FBQyxNQUFNLEVBQUUsUUFBUSxDQUFDLENBQUM7WUFDckMsSUFBSSxDQUFDLEtBQUssQ0FBQyxzQkFBc0IsQ0FBQyxNQUFNLEVBQUUsd0NBQWdCLENBQUMsSUFBSSxDQUFDLFFBQVEsRUFBRSxJQUFJLENBQUMsY0FBYyxDQUFDLEVBQUUsUUFBUSxDQUFDLEVBQUUsRUFBRSxRQUFRLENBQUMsS0FBSyxFQUFFLFFBQVEsQ0FBQyxRQUFRLENBQUMsQ0FBQztZQUNoSixPQUFPO2dCQUNOLE9BQU8sRUFBRSxHQUFHLEVBQUU7b0JBQ2IsSUFBSSxDQUFDLEtBQUssQ0FBQyx3QkFBd0IsQ0FBQyxNQUFNLENBQUMsQ0FBQztvQkFDNUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxNQUFNLENBQUMsTUFBTSxDQUFDLENBQUM7Z0JBQy9CLENBQUM7YUFDRCxDQUFDO1FBQ0gsQ0FBQzs7SUE3QkYsb0NBOEJDIn0=