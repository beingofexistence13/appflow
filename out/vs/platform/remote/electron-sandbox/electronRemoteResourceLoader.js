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
define(["require", "exports", "vs/base/common/buffer", "vs/base/common/lifecycle", "vs/base/common/mime", "vs/base/common/network", "vs/base/common/uri", "vs/platform/files/common/files", "vs/platform/ipc/common/mainProcessService", "vs/platform/remote/common/electronRemoteResources"], function (require, exports, buffer_1, lifecycle_1, mime_1, network_1, uri_1, files_1, mainProcessService_1, electronRemoteResources_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.ElectronRemoteResourceLoader = void 0;
    let ElectronRemoteResourceLoader = class ElectronRemoteResourceLoader extends lifecycle_1.Disposable {
        constructor(windowId, mainProcessService, fileService) {
            super();
            this.windowId = windowId;
            this.fileService = fileService;
            const channel = {
                listen(_, event) {
                    throw new Error(`Event not found: ${event}`);
                },
                call: (_, command, arg) => {
                    switch (command) {
                        case electronRemoteResources_1.NODE_REMOTE_RESOURCE_IPC_METHOD_NAME: return this.doRequest(uri_1.URI.revive(arg[0]));
                    }
                    throw new Error(`Call not found: ${command}`);
                }
            };
            mainProcessService.registerChannel(electronRemoteResources_1.NODE_REMOTE_RESOURCE_CHANNEL_NAME, channel);
        }
        async doRequest(uri) {
            let content;
            try {
                const params = new URLSearchParams(uri.query);
                const actual = uri.with({
                    scheme: params.get('scheme'),
                    authority: params.get('authority'),
                    query: '',
                });
                content = await this.fileService.readFile(actual);
            }
            catch (e) {
                const str = (0, buffer_1.encodeBase64)(buffer_1.VSBuffer.fromString(e.message));
                if (e instanceof files_1.FileOperationError && e.fileOperationResult === 1 /* FileOperationResult.FILE_NOT_FOUND */) {
                    return { statusCode: 404, body: str };
                }
                else {
                    return { statusCode: 500, body: str };
                }
            }
            const mimeType = uri.path && (0, mime_1.getMediaOrTextMime)(uri.path);
            return { statusCode: 200, body: (0, buffer_1.encodeBase64)(content.value), mimeType };
        }
        getResourceUriProvider() {
            return (uri) => uri.with({
                scheme: network_1.Schemas.vscodeManagedRemoteResource,
                authority: `window:${this.windowId}`,
                query: new URLSearchParams({ authority: uri.authority, scheme: uri.scheme }).toString(),
            });
        }
    };
    exports.ElectronRemoteResourceLoader = ElectronRemoteResourceLoader;
    exports.ElectronRemoteResourceLoader = ElectronRemoteResourceLoader = __decorate([
        __param(1, mainProcessService_1.IMainProcessService),
        __param(2, files_1.IFileService)
    ], ElectronRemoteResourceLoader);
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZWxlY3Ryb25SZW1vdGVSZXNvdXJjZUxvYWRlci5qcyIsInNvdXJjZVJvb3QiOiJmaWxlOi8vL3dvcmtzcGFjZS9hcHBmbG93L3NyYy8iLCJzb3VyY2VzIjpbInZzL3BsYXRmb3JtL3JlbW90ZS9lbGVjdHJvbi1zYW5kYm94L2VsZWN0cm9uUmVtb3RlUmVzb3VyY2VMb2FkZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7Ozs7Ozs7Ozs7O0lBYXpGLElBQU0sNEJBQTRCLEdBQWxDLE1BQU0sNEJBQTZCLFNBQVEsc0JBQVU7UUFDM0QsWUFDa0IsUUFBZ0IsRUFDWixrQkFBdUMsRUFDN0IsV0FBeUI7WUFFeEQsS0FBSyxFQUFFLENBQUM7WUFKUyxhQUFRLEdBQVIsUUFBUSxDQUFRO1lBRUYsZ0JBQVcsR0FBWCxXQUFXLENBQWM7WUFJeEQsTUFBTSxPQUFPLEdBQW1CO2dCQUMvQixNQUFNLENBQUksQ0FBVSxFQUFFLEtBQWE7b0JBQ2xDLE1BQU0sSUFBSSxLQUFLLENBQUMsb0JBQW9CLEtBQUssRUFBRSxDQUFDLENBQUM7Z0JBQzlDLENBQUM7Z0JBRUQsSUFBSSxFQUFFLENBQUMsQ0FBVSxFQUFFLE9BQWUsRUFBRSxHQUFTLEVBQWdCLEVBQUU7b0JBQzlELFFBQVEsT0FBTyxFQUFFO3dCQUNoQixLQUFLLDhEQUFvQyxDQUFDLENBQUMsT0FBTyxJQUFJLENBQUMsU0FBUyxDQUFDLFNBQUcsQ0FBQyxNQUFNLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztxQkFDckY7b0JBRUQsTUFBTSxJQUFJLEtBQUssQ0FBQyxtQkFBbUIsT0FBTyxFQUFFLENBQUMsQ0FBQztnQkFDL0MsQ0FBQzthQUNELENBQUM7WUFFRixrQkFBa0IsQ0FBQyxlQUFlLENBQUMsMkRBQWlDLEVBQUUsT0FBTyxDQUFDLENBQUM7UUFDaEYsQ0FBQztRQUVPLEtBQUssQ0FBQyxTQUFTLENBQUMsR0FBUTtZQUMvQixJQUFJLE9BQXFCLENBQUM7WUFDMUIsSUFBSTtnQkFDSCxNQUFNLE1BQU0sR0FBRyxJQUFJLGVBQWUsQ0FBQyxHQUFHLENBQUMsS0FBSyxDQUFDLENBQUM7Z0JBQzlDLE1BQU0sTUFBTSxHQUFHLEdBQUcsQ0FBQyxJQUFJLENBQUM7b0JBQ3ZCLE1BQU0sRUFBRSxNQUFNLENBQUMsR0FBRyxDQUFDLFFBQVEsQ0FBRTtvQkFDN0IsU0FBUyxFQUFFLE1BQU0sQ0FBQyxHQUFHLENBQUMsV0FBVyxDQUFFO29CQUNuQyxLQUFLLEVBQUUsRUFBRTtpQkFDVCxDQUFDLENBQUM7Z0JBQ0gsT0FBTyxHQUFHLE1BQU0sSUFBSSxDQUFDLFdBQVcsQ0FBQyxRQUFRLENBQUMsTUFBTSxDQUFDLENBQUM7YUFDbEQ7WUFBQyxPQUFPLENBQUMsRUFBRTtnQkFDWCxNQUFNLEdBQUcsR0FBRyxJQUFBLHFCQUFZLEVBQUMsaUJBQVEsQ0FBQyxVQUFVLENBQUMsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUM7Z0JBQ3pELElBQUksQ0FBQyxZQUFZLDBCQUFrQixJQUFJLENBQUMsQ0FBQyxtQkFBbUIsK0NBQXVDLEVBQUU7b0JBQ3BHLE9BQU8sRUFBRSxVQUFVLEVBQUUsR0FBRyxFQUFFLElBQUksRUFBRSxHQUFHLEVBQUUsQ0FBQztpQkFDdEM7cUJBQU07b0JBQ04sT0FBTyxFQUFFLFVBQVUsRUFBRSxHQUFHLEVBQUUsSUFBSSxFQUFFLEdBQUcsRUFBRSxDQUFDO2lCQUN0QzthQUNEO1lBRUQsTUFBTSxRQUFRLEdBQUcsR0FBRyxDQUFDLElBQUksSUFBSSxJQUFBLHlCQUFrQixFQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsQ0FBQztZQUMxRCxPQUFPLEVBQUUsVUFBVSxFQUFFLEdBQUcsRUFBRSxJQUFJLEVBQUUsSUFBQSxxQkFBWSxFQUFDLE9BQU8sQ0FBQyxLQUFLLENBQUMsRUFBRSxRQUFRLEVBQUUsQ0FBQztRQUN6RSxDQUFDO1FBRU0sc0JBQXNCO1lBQzVCLE9BQU8sQ0FBQyxHQUFRLEVBQUUsRUFBRSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUM7Z0JBQzdCLE1BQU0sRUFBRSxpQkFBTyxDQUFDLDJCQUEyQjtnQkFDM0MsU0FBUyxFQUFFLFVBQVUsSUFBSSxDQUFDLFFBQVEsRUFBRTtnQkFDcEMsS0FBSyxFQUFFLElBQUksZUFBZSxDQUFDLEVBQUUsU0FBUyxFQUFFLEdBQUcsQ0FBQyxTQUFTLEVBQUUsTUFBTSxFQUFFLEdBQUcsQ0FBQyxNQUFNLEVBQUUsQ0FBQyxDQUFDLFFBQVEsRUFBRTthQUN2RixDQUFDLENBQUM7UUFDSixDQUFDO0tBQ0QsQ0FBQTtJQXZEWSxvRUFBNEI7MkNBQTVCLDRCQUE0QjtRQUd0QyxXQUFBLHdDQUFtQixDQUFBO1FBQ25CLFdBQUEsb0JBQVksQ0FBQTtPQUpGLDRCQUE0QixDQXVEeEMifQ==