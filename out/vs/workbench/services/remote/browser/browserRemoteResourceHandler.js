/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
define(["require", "exports", "vs/base/common/buffer", "vs/base/common/lifecycle", "vs/base/common/mime", "vs/base/common/uri", "vs/platform/files/common/files"], function (require, exports, buffer_1, lifecycle_1, mime_1, uri_1, files_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.BrowserRemoteResourceLoader = void 0;
    let BrowserRemoteResourceLoader = class BrowserRemoteResourceLoader extends lifecycle_1.Disposable {
        constructor(fileService, provider) {
            super();
            this.provider = provider;
            this._register(provider.onDidReceiveRequest(async (request) => {
                let uri;
                try {
                    uri = JSON.parse(decodeURIComponent(request.uri.query));
                }
                catch {
                    return request.respondWith(404, new Uint8Array(), {});
                }
                let content;
                try {
                    content = await fileService.readFile(uri_1.URI.from(uri, true));
                }
                catch (e) {
                    const str = buffer_1.VSBuffer.fromString(e.message).buffer;
                    if (e instanceof files_1.FileOperationError && e.fileOperationResult === 1 /* FileOperationResult.FILE_NOT_FOUND */) {
                        return request.respondWith(404, str, {});
                    }
                    else {
                        return request.respondWith(500, str, {});
                    }
                }
                const mime = uri.path && (0, mime_1.getMediaOrTextMime)(uri.path);
                request.respondWith(200, content.value.buffer, mime ? { 'content-type': mime } : {});
            }));
        }
        getResourceUriProvider() {
            const baseUri = uri_1.URI.parse(document.location.href);
            return uri => baseUri.with({
                path: this.provider.path,
                query: JSON.stringify(uri),
            });
        }
    };
    exports.BrowserRemoteResourceLoader = BrowserRemoteResourceLoader;
    exports.BrowserRemoteResourceLoader = BrowserRemoteResourceLoader = __decorate([
        __param(0, files_1.IFileService)
    ], BrowserRemoteResourceLoader);
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYnJvd3NlclJlbW90ZVJlc291cmNlSGFuZGxlci5qcyIsInNvdXJjZVJvb3QiOiJmaWxlOi8vL3dvcmtzcGFjZS9hcHBmbG93L3NyYy8iLCJzb3VyY2VzIjpbInZzL3dvcmtiZW5jaC9zZXJ2aWNlcy9yZW1vdGUvYnJvd3Nlci9icm93c2VyUmVtb3RlUmVzb3VyY2VIYW5kbGVyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Z0dBR2dHOzs7Ozs7Ozs7Ozs7OztJQVN6RixJQUFNLDJCQUEyQixHQUFqQyxNQUFNLDJCQUE0QixTQUFRLHNCQUFVO1FBQzFELFlBQ2UsV0FBeUIsRUFDdEIsUUFBaUM7WUFFbEQsS0FBSyxFQUFFLENBQUM7WUFGUyxhQUFRLEdBQVIsUUFBUSxDQUF5QjtZQUlsRCxJQUFJLENBQUMsU0FBUyxDQUFDLFFBQVEsQ0FBQyxtQkFBbUIsQ0FBQyxLQUFLLEVBQUMsT0FBTyxFQUFDLEVBQUU7Z0JBQzNELElBQUksR0FBa0IsQ0FBQztnQkFDdkIsSUFBSTtvQkFDSCxHQUFHLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxrQkFBa0IsQ0FBQyxPQUFPLENBQUMsR0FBRyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUM7aUJBQ3hEO2dCQUFDLE1BQU07b0JBQ1AsT0FBTyxPQUFPLENBQUMsV0FBVyxDQUFDLEdBQUcsRUFBRSxJQUFJLFVBQVUsRUFBRSxFQUFFLEVBQUUsQ0FBQyxDQUFDO2lCQUN0RDtnQkFFRCxJQUFJLE9BQXFCLENBQUM7Z0JBQzFCLElBQUk7b0JBQ0gsT0FBTyxHQUFHLE1BQU0sV0FBVyxDQUFDLFFBQVEsQ0FBQyxTQUFHLENBQUMsSUFBSSxDQUFDLEdBQUcsRUFBRSxJQUFJLENBQUMsQ0FBQyxDQUFDO2lCQUMxRDtnQkFBQyxPQUFPLENBQUMsRUFBRTtvQkFDWCxNQUFNLEdBQUcsR0FBRyxpQkFBUSxDQUFDLFVBQVUsQ0FBQyxDQUFDLENBQUMsT0FBTyxDQUFDLENBQUMsTUFBTSxDQUFDO29CQUNsRCxJQUFJLENBQUMsWUFBWSwwQkFBa0IsSUFBSSxDQUFDLENBQUMsbUJBQW1CLCtDQUF1QyxFQUFFO3dCQUNwRyxPQUFPLE9BQU8sQ0FBQyxXQUFXLENBQUMsR0FBRyxFQUFFLEdBQUcsRUFBRSxFQUFFLENBQUMsQ0FBQztxQkFDekM7eUJBQU07d0JBQ04sT0FBTyxPQUFPLENBQUMsV0FBVyxDQUFDLEdBQUcsRUFBRSxHQUFHLEVBQUUsRUFBRSxDQUFDLENBQUM7cUJBQ3pDO2lCQUNEO2dCQUVELE1BQU0sSUFBSSxHQUFHLEdBQUcsQ0FBQyxJQUFJLElBQUksSUFBQSx5QkFBa0IsRUFBQyxHQUFHLENBQUMsSUFBSSxDQUFDLENBQUM7Z0JBQ3RELE9BQU8sQ0FBQyxXQUFXLENBQUMsR0FBRyxFQUFFLE9BQU8sQ0FBQyxLQUFLLENBQUMsTUFBTSxFQUFFLElBQUksQ0FBQyxDQUFDLENBQUMsRUFBRSxjQUFjLEVBQUUsSUFBSSxFQUFFLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDO1lBQ3RGLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFDTCxDQUFDO1FBRU0sc0JBQXNCO1lBQzVCLE1BQU0sT0FBTyxHQUFHLFNBQUcsQ0FBQyxLQUFLLENBQUMsUUFBUSxDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUMsQ0FBQztZQUNsRCxPQUFPLEdBQUcsQ0FBQyxFQUFFLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQztnQkFDMUIsSUFBSSxFQUFFLElBQUksQ0FBQyxRQUFRLENBQUMsSUFBSTtnQkFDeEIsS0FBSyxFQUFFLElBQUksQ0FBQyxTQUFTLENBQUMsR0FBRyxDQUFDO2FBQzFCLENBQUMsQ0FBQztRQUNKLENBQUM7S0FDRCxDQUFBO0lBdkNZLGtFQUEyQjswQ0FBM0IsMkJBQTJCO1FBRXJDLFdBQUEsb0JBQVksQ0FBQTtPQUZGLDJCQUEyQixDQXVDdkMifQ==