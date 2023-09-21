/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/platform/instantiation/common/extensions", "vs/platform/workspace/common/canonicalUri"], function (require, exports, extensions_1, canonicalUri_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.CanonicalUriService = void 0;
    class CanonicalUriService {
        constructor() {
            this._providers = new Map();
        }
        registerCanonicalUriProvider(provider) {
            this._providers.set(provider.scheme, provider);
            return {
                dispose: () => this._providers.delete(provider.scheme)
            };
        }
        async provideCanonicalUri(uri, targetScheme, token) {
            const provider = this._providers.get(uri.scheme);
            if (provider) {
                return provider.provideCanonicalUri(uri, targetScheme, token);
            }
            return undefined;
        }
    }
    exports.CanonicalUriService = CanonicalUriService;
    (0, extensions_1.registerSingleton)(canonicalUri_1.ICanonicalUriService, CanonicalUriService, 1 /* InstantiationType.Delayed */);
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY2Fub25pY2FsVXJpU2VydmljZS5qcyIsInNvdXJjZVJvb3QiOiJmaWxlOi8vL3dvcmtzcGFjZS9hcHBmbG93L3NyYy8iLCJzb3VyY2VzIjpbInZzL3dvcmtiZW5jaC9zZXJ2aWNlcy93b3Jrc3BhY2VzL2NvbW1vbi9jYW5vbmljYWxVcmlTZXJ2aWNlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Z0dBR2dHOzs7OztJQVFoRyxNQUFhLG1CQUFtQjtRQUFoQztZQUdrQixlQUFVLEdBQUcsSUFBSSxHQUFHLEVBQWlDLENBQUM7UUFnQnhFLENBQUM7UUFkQSw0QkFBNEIsQ0FBQyxRQUErQjtZQUMzRCxJQUFJLENBQUMsVUFBVSxDQUFDLEdBQUcsQ0FBQyxRQUFRLENBQUMsTUFBTSxFQUFFLFFBQVEsQ0FBQyxDQUFDO1lBQy9DLE9BQU87Z0JBQ04sT0FBTyxFQUFFLEdBQUcsRUFBRSxDQUFDLElBQUksQ0FBQyxVQUFVLENBQUMsTUFBTSxDQUFDLFFBQVEsQ0FBQyxNQUFNLENBQUM7YUFDdEQsQ0FBQztRQUNILENBQUM7UUFFRCxLQUFLLENBQUMsbUJBQW1CLENBQUMsR0FBUSxFQUFFLFlBQW9CLEVBQUUsS0FBd0I7WUFDakYsTUFBTSxRQUFRLEdBQUcsSUFBSSxDQUFDLFVBQVUsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLE1BQU0sQ0FBQyxDQUFDO1lBQ2pELElBQUksUUFBUSxFQUFFO2dCQUNiLE9BQU8sUUFBUSxDQUFDLG1CQUFtQixDQUFDLEdBQUcsRUFBRSxZQUFZLEVBQUUsS0FBSyxDQUFDLENBQUM7YUFDOUQ7WUFDRCxPQUFPLFNBQVMsQ0FBQztRQUNsQixDQUFDO0tBQ0Q7SUFuQkQsa0RBbUJDO0lBRUQsSUFBQSw4QkFBaUIsRUFBQyxtQ0FBb0IsRUFBRSxtQkFBbUIsb0NBQTRCLENBQUMifQ==