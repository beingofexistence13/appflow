/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/platform/files/common/files", "vs/base/common/event", "vs/base/common/lifecycle", "vs/base/common/errors"], function (require, exports, files_1, event_1, lifecycle_1, errors_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$v3b = void 0;
    class $v3b {
        constructor() {
            this.capabilities = 2048 /* FileSystemProviderCapabilities.Readonly */ + 2 /* FileSystemProviderCapabilities.FileReadWrite */ + 1024 /* FileSystemProviderCapabilities.PathCaseSensitive */;
            this.onDidChangeCapabilities = event_1.Event.None;
            this.onDidChangeFile = event_1.Event.None;
        }
        // working implementations
        async readFile(resource) {
            try {
                const res = await fetch(resource.toString(true));
                if (res.status === 200) {
                    return new Uint8Array(await res.arrayBuffer());
                }
                throw (0, files_1.$fk)(res.statusText, files_1.FileSystemProviderErrorCode.Unknown);
            }
            catch (err) {
                throw (0, files_1.$fk)(err, files_1.FileSystemProviderErrorCode.Unknown);
            }
        }
        // fake implementations
        async stat(_resource) {
            return {
                type: files_1.FileType.File,
                size: 0,
                mtime: 0,
                ctime: 0
            };
        }
        watch() {
            return lifecycle_1.$kc.None;
        }
        // error implementations
        writeFile(_resource, _content, _opts) {
            throw new errors_1.$0();
        }
        readdir(_resource) {
            throw new errors_1.$0();
        }
        mkdir(_resource) {
            throw new errors_1.$0();
        }
        delete(_resource, _opts) {
            throw new errors_1.$0();
        }
        rename(_from, _to, _opts) {
            throw new errors_1.$0();
        }
    }
    exports.$v3b = $v3b;
});
//# sourceMappingURL=webWorkerFileSystemProvider.js.map