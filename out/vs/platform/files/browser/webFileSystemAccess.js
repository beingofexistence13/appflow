/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.WebFileSystemAccess = void 0;
    /**
     * Typings for the https://wicg.github.io/file-system-access
     *
     * Use `supported(window)` to find out if the browser supports this kind of API.
     */
    var WebFileSystemAccess;
    (function (WebFileSystemAccess) {
        function supported(obj) {
            if (typeof obj?.showDirectoryPicker === 'function') {
                return true;
            }
            return false;
        }
        WebFileSystemAccess.supported = supported;
        function isFileSystemHandle(handle) {
            const candidate = handle;
            if (!candidate) {
                return false;
            }
            return typeof candidate.kind === 'string' && typeof candidate.queryPermission === 'function' && typeof candidate.requestPermission === 'function';
        }
        WebFileSystemAccess.isFileSystemHandle = isFileSystemHandle;
        function isFileSystemFileHandle(handle) {
            return handle.kind === 'file';
        }
        WebFileSystemAccess.isFileSystemFileHandle = isFileSystemFileHandle;
        function isFileSystemDirectoryHandle(handle) {
            return handle.kind === 'directory';
        }
        WebFileSystemAccess.isFileSystemDirectoryHandle = isFileSystemDirectoryHandle;
    })(WebFileSystemAccess || (exports.WebFileSystemAccess = WebFileSystemAccess = {}));
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoid2ViRmlsZVN5c3RlbUFjY2Vzcy5qcyIsInNvdXJjZVJvb3QiOiJmaWxlOi8vL3dvcmtzcGFjZS9hcHBmbG93L3NyYy8iLCJzb3VyY2VzIjpbInZzL3BsYXRmb3JtL2ZpbGVzL2Jyb3dzZXIvd2ViRmlsZVN5c3RlbUFjY2Vzcy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O2dHQUdnRzs7Ozs7SUFFaEc7Ozs7T0FJRztJQUNILElBQWlCLG1CQUFtQixDQTBCbkM7SUExQkQsV0FBaUIsbUJBQW1CO1FBRW5DLFNBQWdCLFNBQVMsQ0FBQyxHQUFpQjtZQUMxQyxJQUFJLE9BQU8sR0FBRyxFQUFFLG1CQUFtQixLQUFLLFVBQVUsRUFBRTtnQkFDbkQsT0FBTyxJQUFJLENBQUM7YUFDWjtZQUVELE9BQU8sS0FBSyxDQUFDO1FBQ2QsQ0FBQztRQU5lLDZCQUFTLFlBTXhCLENBQUE7UUFFRCxTQUFnQixrQkFBa0IsQ0FBQyxNQUFlO1lBQ2pELE1BQU0sU0FBUyxHQUFHLE1BQXNDLENBQUM7WUFDekQsSUFBSSxDQUFDLFNBQVMsRUFBRTtnQkFDZixPQUFPLEtBQUssQ0FBQzthQUNiO1lBRUQsT0FBTyxPQUFPLFNBQVMsQ0FBQyxJQUFJLEtBQUssUUFBUSxJQUFJLE9BQU8sU0FBUyxDQUFDLGVBQWUsS0FBSyxVQUFVLElBQUksT0FBTyxTQUFTLENBQUMsaUJBQWlCLEtBQUssVUFBVSxDQUFDO1FBQ25KLENBQUM7UUFQZSxzQ0FBa0IscUJBT2pDLENBQUE7UUFFRCxTQUFnQixzQkFBc0IsQ0FBQyxNQUF3QjtZQUM5RCxPQUFPLE1BQU0sQ0FBQyxJQUFJLEtBQUssTUFBTSxDQUFDO1FBQy9CLENBQUM7UUFGZSwwQ0FBc0IseUJBRXJDLENBQUE7UUFFRCxTQUFnQiwyQkFBMkIsQ0FBQyxNQUF3QjtZQUNuRSxPQUFPLE1BQU0sQ0FBQyxJQUFJLEtBQUssV0FBVyxDQUFDO1FBQ3BDLENBQUM7UUFGZSwrQ0FBMkIsOEJBRTFDLENBQUE7SUFDRixDQUFDLEVBMUJnQixtQkFBbUIsbUNBQW5CLG1CQUFtQixRQTBCbkMifQ==