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
//# sourceMappingURL=webFileSystemAccess.js.map