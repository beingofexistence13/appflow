/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/extpath", "vs/base/common/network", "vs/base/common/path", "vs/base/common/uri", "vs/platform/files/common/files", "vs/platform/webview/common/mimeTypes"], function (require, exports, extpath_1, network_1, path_1, uri_1, files_1, mimeTypes_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.loadLocalResource = exports.WebviewResourceResponse = void 0;
    var WebviewResourceResponse;
    (function (WebviewResourceResponse) {
        let Type;
        (function (Type) {
            Type[Type["Success"] = 0] = "Success";
            Type[Type["Failed"] = 1] = "Failed";
            Type[Type["AccessDenied"] = 2] = "AccessDenied";
            Type[Type["NotModified"] = 3] = "NotModified";
        })(Type = WebviewResourceResponse.Type || (WebviewResourceResponse.Type = {}));
        class StreamSuccess {
            constructor(stream, etag, mtime, mimeType) {
                this.stream = stream;
                this.etag = etag;
                this.mtime = mtime;
                this.mimeType = mimeType;
                this.type = Type.Success;
            }
        }
        WebviewResourceResponse.StreamSuccess = StreamSuccess;
        WebviewResourceResponse.Failed = { type: Type.Failed };
        WebviewResourceResponse.AccessDenied = { type: Type.AccessDenied };
        class NotModified {
            constructor(mimeType, mtime) {
                this.mimeType = mimeType;
                this.mtime = mtime;
                this.type = Type.NotModified;
            }
        }
        WebviewResourceResponse.NotModified = NotModified;
    })(WebviewResourceResponse || (exports.WebviewResourceResponse = WebviewResourceResponse = {}));
    async function loadLocalResource(requestUri, options, fileService, logService, token) {
        logService.debug(`loadLocalResource - begin. requestUri=${requestUri}`);
        const resourceToLoad = getResourceToLoad(requestUri, options.roots);
        logService.debug(`loadLocalResource - found resource to load. requestUri=${requestUri}, resourceToLoad=${resourceToLoad}`);
        if (!resourceToLoad) {
            return WebviewResourceResponse.AccessDenied;
        }
        const mime = (0, mimeTypes_1.getWebviewContentMimeType)(requestUri); // Use the original path for the mime
        try {
            const result = await fileService.readFileStream(resourceToLoad, { etag: options.ifNoneMatch }, token);
            return new WebviewResourceResponse.StreamSuccess(result.value, result.etag, result.mtime, mime);
        }
        catch (err) {
            if (err instanceof files_1.FileOperationError) {
                const result = err.fileOperationResult;
                // NotModified status is expected and can be handled gracefully
                if (result === 2 /* FileOperationResult.FILE_NOT_MODIFIED_SINCE */) {
                    return new WebviewResourceResponse.NotModified(mime, err.options?.mtime);
                }
            }
            // Otherwise the error is unexpected.
            logService.debug(`loadLocalResource - Error using fileReader. requestUri=${requestUri}`);
            console.log(err);
            return WebviewResourceResponse.Failed;
        }
    }
    exports.loadLocalResource = loadLocalResource;
    function getResourceToLoad(requestUri, roots) {
        for (const root of roots) {
            if (containsResource(root, requestUri)) {
                return normalizeResourcePath(requestUri);
            }
        }
        return undefined;
    }
    function containsResource(root, resource) {
        if (root.scheme !== resource.scheme) {
            return false;
        }
        let resourceFsPath = (0, path_1.normalize)(resource.fsPath);
        let rootPath = (0, path_1.normalize)(root.fsPath + (root.fsPath.endsWith(path_1.sep) ? '' : path_1.sep));
        if ((0, extpath_1.isUNC)(root.fsPath) && (0, extpath_1.isUNC)(resource.fsPath)) {
            rootPath = rootPath.toLowerCase();
            resourceFsPath = resourceFsPath.toLowerCase();
        }
        return resourceFsPath.startsWith(rootPath);
    }
    function normalizeResourcePath(resource) {
        // Rewrite remote uris to a path that the remote file system can understand
        if (resource.scheme === network_1.Schemas.vscodeRemote) {
            return uri_1.URI.from({
                scheme: network_1.Schemas.vscodeRemote,
                authority: resource.authority,
                path: '/vscode-resource',
                query: JSON.stringify({
                    requestResourcePath: resource.path
                })
            });
        }
        return resource;
    }
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicmVzb3VyY2VMb2FkaW5nLmpzIiwic291cmNlUm9vdCI6ImZpbGU6Ly8vd29ya3NwYWNlL2FwcGZsb3cvc3JjLyIsInNvdXJjZXMiOlsidnMvd29ya2JlbmNoL2NvbnRyaWIvd2Vidmlldy9icm93c2VyL3Jlc291cmNlTG9hZGluZy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O2dHQUdnRzs7Ozs7SUFZaEcsSUFBaUIsdUJBQXVCLENBMkJ2QztJQTNCRCxXQUFpQix1QkFBdUI7UUFDdkMsSUFBWSxJQUFtRDtRQUEvRCxXQUFZLElBQUk7WUFBRyxxQ0FBTyxDQUFBO1lBQUUsbUNBQU0sQ0FBQTtZQUFFLCtDQUFZLENBQUE7WUFBRSw2Q0FBVyxDQUFBO1FBQUMsQ0FBQyxFQUFuRCxJQUFJLEdBQUosNEJBQUksS0FBSiw0QkFBSSxRQUErQztRQUUvRCxNQUFhLGFBQWE7WUFHekIsWUFDaUIsTUFBOEIsRUFDOUIsSUFBd0IsRUFDeEIsS0FBeUIsRUFDekIsUUFBZ0I7Z0JBSGhCLFdBQU0sR0FBTixNQUFNLENBQXdCO2dCQUM5QixTQUFJLEdBQUosSUFBSSxDQUFvQjtnQkFDeEIsVUFBSyxHQUFMLEtBQUssQ0FBb0I7Z0JBQ3pCLGFBQVEsR0FBUixRQUFRLENBQVE7Z0JBTnhCLFNBQUksR0FBRyxJQUFJLENBQUMsT0FBTyxDQUFDO1lBT3pCLENBQUM7U0FDTDtRQVRZLHFDQUFhLGdCQVN6QixDQUFBO1FBRVksOEJBQU0sR0FBRyxFQUFFLElBQUksRUFBRSxJQUFJLENBQUMsTUFBTSxFQUFXLENBQUM7UUFDeEMsb0NBQVksR0FBRyxFQUFFLElBQUksRUFBRSxJQUFJLENBQUMsWUFBWSxFQUFXLENBQUM7UUFFakUsTUFBYSxXQUFXO1lBR3ZCLFlBQ2lCLFFBQWdCLEVBQ2hCLEtBQXlCO2dCQUR6QixhQUFRLEdBQVIsUUFBUSxDQUFRO2dCQUNoQixVQUFLLEdBQUwsS0FBSyxDQUFvQjtnQkFKakMsU0FBSSxHQUFHLElBQUksQ0FBQyxXQUFXLENBQUM7WUFL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