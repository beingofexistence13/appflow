/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/errors", "vs/base/common/uri", "vs/workbench/api/common/extHostTypes", "./extHost.protocol", "vs/base/common/network", "vs/base/common/cancellation", "vs/base/common/strings"], function (require, exports, errors_1, uri_1, extHostTypes_1, extHost_protocol_1, network_1, cancellation_1, strings_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.ExtHostDocumentContentProvider = void 0;
    class ExtHostDocumentContentProvider {
        static { this._handlePool = 0; }
        constructor(mainContext, _documentsAndEditors, _logService) {
            this._documentsAndEditors = _documentsAndEditors;
            this._logService = _logService;
            this._documentContentProviders = new Map();
            this._proxy = mainContext.getProxy(extHost_protocol_1.MainContext.MainThreadDocumentContentProviders);
        }
        registerTextDocumentContentProvider(scheme, provider) {
            // todo@remote
            // check with scheme from fs-providers!
            if (Object.keys(network_1.Schemas).indexOf(scheme) >= 0) {
                throw new Error(`scheme '${scheme}' already registered`);
            }
            const handle = ExtHostDocumentContentProvider._handlePool++;
            this._documentContentProviders.set(handle, provider);
            this._proxy.$registerTextContentProvider(handle, scheme);
            let subscription;
            if (typeof provider.onDidChange === 'function') {
                subscription = provider.onDidChange(uri => {
                    if (uri.scheme !== scheme) {
                        this._logService.warn(`Provider for scheme '${scheme}' is firing event for schema '${uri.scheme}' which will be IGNORED`);
                        return;
                    }
                    if (this._documentsAndEditors.getDocument(uri)) {
                        this.$provideTextDocumentContent(handle, uri).then(value => {
                            if (!value && typeof value !== 'string') {
                                return;
                            }
                            const document = this._documentsAndEditors.getDocument(uri);
                            if (!document) {
                                // disposed in the meantime
                                return;
                            }
                            // create lines and compare
                            const lines = (0, strings_1.splitLines)(value);
                            // broadcast event when content changed
                            if (!document.equalLines(lines)) {
                                return this._proxy.$onVirtualDocumentChange(uri, value);
                            }
                        }, errors_1.onUnexpectedError);
                    }
                });
            }
            return new extHostTypes_1.Disposable(() => {
                if (this._documentContentProviders.delete(handle)) {
                    this._proxy.$unregisterTextContentProvider(handle);
                }
                if (subscription) {
                    subscription.dispose();
                    subscription = undefined;
                }
            });
        }
        $provideTextDocumentContent(handle, uri) {
            const provider = this._documentContentProviders.get(handle);
            if (!provider) {
                return Promise.reject(new Error(`unsupported uri-scheme: ${uri.scheme}`));
            }
            return Promise.resolve(provider.provideTextDocumentContent(uri_1.URI.revive(uri), cancellation_1.CancellationToken.None));
        }
    }
    exports.ExtHostDocumentContentProvider = ExtHostDocumentContentProvider;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZXh0SG9zdERvY3VtZW50Q29udGVudFByb3ZpZGVycy5qcyIsInNvdXJjZVJvb3QiOiJmaWxlOi8vL3dvcmtzcGFjZS9hcHBmbG93L3NyYy8iLCJzb3VyY2VzIjpbInZzL3dvcmtiZW5jaC9hcGkvY29tbW9uL2V4dEhvc3REb2N1bWVudENvbnRlbnRQcm92aWRlcnMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7O0lBY2hHLE1BQWEsOEJBQThCO2lCQUUzQixnQkFBVyxHQUFHLENBQUMsQUFBSixDQUFLO1FBSy9CLFlBQ0MsV0FBeUIsRUFDUixvQkFBZ0QsRUFDaEQsV0FBd0I7WUFEeEIseUJBQW9CLEdBQXBCLG9CQUFvQixDQUE0QjtZQUNoRCxnQkFBVyxHQUFYLFdBQVcsQ0FBYTtZQU56Qiw4QkFBeUIsR0FBRyxJQUFJLEdBQUcsRUFBOEMsQ0FBQztZQVFsRyxJQUFJLENBQUMsTUFBTSxHQUFHLFdBQVcsQ0FBQyxRQUFRLENBQUMsOEJBQVcsQ0FBQyxrQ0FBa0MsQ0FBQyxDQUFDO1FBQ3BGLENBQUM7UUFFRCxtQ0FBbUMsQ0FBQyxNQUFjLEVBQUUsUUFBNEM7WUFDL0YsY0FBYztZQUNkLHVDQUF1QztZQUN2QyxJQUFJLE1BQU0sQ0FBQyxJQUFJLENBQUMsaUJBQU8sQ0FBQyxDQUFDLE9BQU8sQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLEVBQUU7Z0JBQzlDLE1BQU0sSUFBSSxLQUFLLENBQUMsV0FBVyxNQUFNLHNCQUFzQixDQUFDLENBQUM7YUFDekQ7WUFFRCxNQUFNLE1BQU0sR0FBRyw4QkFBOEIsQ0FBQyxXQUFXLEVBQUUsQ0FBQztZQUU1RCxJQUFJLENBQUMseUJBQXlCLENBQUMsR0FBRyxDQUFDLE1BQU0sRUFBRSxRQUFRLENBQUMsQ0FBQztZQUNyRCxJQUFJLENBQUMsTUFBTSxDQUFDLDRCQUE0QixDQUFDLE1BQU0sRUFBRSxNQUFNLENBQUMsQ0FBQztZQUV6RCxJQUFJLFlBQXFDLENBQUM7WUFDMUMsSUFBSSxPQUFPLFFBQVEsQ0FBQyxXQUFXLEtBQUssVUFBVSxFQUFFO2dCQUMvQyxZQUFZLEdBQUcsUUFBUSxDQUFDLFdBQVcsQ0FBQyxHQUFHLENBQUMsRUFBRTtvQkFDekMsSUFBSSxHQUFHLENBQUMsTUFBTSxLQUFLLE1BQU0sRUFBRTt3QkFDMUIsSUFBSSxDQUFDLFdBQVcsQ0FBQyxJQUFJLENBQUMsd0JBQXdCLE1BQU0saUNBQWlDLEdBQUcsQ0FBQyxNQUFNLHlCQUF5QixDQUFDLENBQUM7d0JBQzFILE9BQU87cUJBQ1A7b0JBQ0QsSUFBSSxJQUFJLENBQUMsb0JBQW9CLENBQUMsV0FBVyxDQUFDLEdBQUcsQ0FBQyxFQUFFO3dCQUMvQyxJQUFJLENBQUMsMkJBQTJCLENBQUMsTUFBTSxFQUFFLEdBQUcsQ0FBQyxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsRUFBRTs0QkFDMUQsSUFBSSxDQUFDLEtBQUssSUFBSSxPQUFPLEtBQUssS0FBSyxRQUFRLEVBQUU7Z0NBQ3hDLE9BQU87NkJBQ1A7NEJBRUQsTUFBTSxRQUFRLEdBQUcsSUFBSSxDQUFDLG9CQUFvQixDQUFDLFdBQVcsQ0FBQyxHQUFHLENBQUMsQ0FBQzs0QkFDNUQsSUFBSSxDQUFDLFFBQVEsRUFBRTtnQ0FDZCwyQkFBMkI7Z0NBQzNCLE9BQU87NkJBQ1A7NEJBRUQsMkJBQTJCOzRCQUMzQixNQUFNLEtBQUssR0FBRyxJQUFBLG9CQUFVLEVBQUMsS0FBSyxDQUFDLENBQUM7NEJBRWhDLHVDQUF1Qzs0QkFDdkMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxVQUFVLENBQUMsS0FBSyxDQUFDLEVBQUU7Z0NBQ2hDLE9BQU8sSUFBSSxDQUFDLE1BQU0sQ0FBQyx3QkFBd0IsQ0FBQyxHQUFHLEVBQUUsS0FBSyxDQUFDLENBQUM7NkJBQ3hEO3dCQUVGLENBQUMsRUFBRSwwQkFBaUIsQ0FBQyxDQUFDO3FCQUN0QjtnQkFDRixDQUFDLENBQUMsQ0FBQzthQUNIO1lBQ0QsT0FBTyxJQUFJLHlCQUFVLENBQUMsR0FBRyxFQUFFO2dCQUMxQixJQUFJLElBQUksQ0FBQyx5QkFBeUIsQ0FBQyxNQUFNLENBQUMsTUFBTSxDQUFDLEVBQUU7b0JBQ2xELElBQUksQ0FBQyxNQUFNLENBQUMsOEJBQThCLENBQUMsTUFBTSxDQUFDLENBQUM7aUJBQ25EO2dCQUNELElBQUksWUFBWSxFQUFFO29CQUNqQixZQUFZLENBQUMsT0FBTyxFQUFFLENBQUM7b0JBQ3ZCLFlBQVksR0FBRyxTQUFTLENBQUM7aUJBQ3pCO1lBQ0YsQ0FBQyxDQUFDLENBQUM7UUFDSixDQUFDO1FBRUQsMkJBQTJCLENBQUMsTUFBYyxFQUFFLEdBQWtCO1lBQzdELE1BQU0sUUFBUSxHQUFHLElBQUksQ0FBQyx5QkFBeUIsQ0FBQyxHQUFHLENBQUMsTUFBTSxDQUFDLENBQUM7WUFDNUQsSUFBSSxDQUFDLFFBQVEsRUFBRTtnQkFDZCxPQUFPLE9BQU8sQ0FBQyxNQUFNLENBQUMsSUFBSSxLQUFLLENBQUMsMkJBQTJCLEdBQUcsQ0FBQyxNQUFNLEVBQUUsQ0FBQyxDQUFDLENBQUM7YUFDMUU7WUFDRCxPQUFPLE9BQU8sQ0FBQyxPQUFPLENBQUMsUUFBUSxDQUFDLDBCQUEwQixDQUFDLFNBQUcsQ0FBQyxNQUFNLENBQUMsR0FBRyxDQUFDLEVBQUUsZ0NBQWlCLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQztRQUN0RyxDQUFDOztJQTNFRix3RUE0RUMifQ==