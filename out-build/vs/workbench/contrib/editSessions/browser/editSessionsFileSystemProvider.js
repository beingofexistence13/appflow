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
define(["require", "exports", "vs/base/common/lifecycle", "vs/base/common/event", "vs/platform/files/common/files", "vs/workbench/contrib/editSessions/common/editSessions", "vs/base/common/errors"], function (require, exports, lifecycle_1, event_1, files_1, editSessions_1, errors_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$c1b = void 0;
    let $c1b = class $c1b {
        static { this.SCHEMA = editSessions_1.$8Zb; }
        constructor(a) {
            this.a = a;
            this.capabilities = 2048 /* FileSystemProviderCapabilities.Readonly */ + 2 /* FileSystemProviderCapabilities.FileReadWrite */;
            //#region Unsupported file operations
            this.onDidChangeCapabilities = event_1.Event.None;
            this.onDidChangeFile = event_1.Event.None;
        }
        async readFile(resource) {
            const match = /(?<ref>[^/]+)\/(?<folderName>[^/]+)\/(?<filePath>.*)/.exec(resource.path.substring(1));
            if (!match?.groups) {
                throw files_1.FileSystemProviderErrorCode.FileNotFound;
            }
            const { ref, folderName, filePath } = match.groups;
            const data = await this.a.read('editSessions', ref);
            if (!data) {
                throw files_1.FileSystemProviderErrorCode.FileNotFound;
            }
            const content = JSON.parse(data.content);
            const change = content.folders.find((f) => f.name === folderName)?.workingChanges.find((change) => change.relativeFilePath === filePath);
            if (!change || change.type === editSessions_1.ChangeType.Deletion) {
                throw files_1.FileSystemProviderErrorCode.FileNotFound;
            }
            return (0, editSessions_1.$9Zb)(content.version, change.contents).buffer;
        }
        async stat(resource) {
            const content = await this.readFile(resource);
            const currentTime = Date.now();
            return {
                type: files_1.FileType.File,
                permissions: files_1.FilePermission.Readonly,
                mtime: currentTime,
                ctime: currentTime,
                size: content.byteLength
            };
        }
        watch(resource, opts) { return lifecycle_1.$kc.None; }
        async mkdir(resource) { }
        async readdir(resource) { return []; }
        async rename(from, to, opts) { }
        async delete(resource, opts) { }
        async writeFile() {
            throw new errors_1.$0();
        }
    };
    exports.$c1b = $c1b;
    exports.$c1b = $c1b = __decorate([
        __param(0, editSessions_1.$UZb)
    ], $c1b);
});
//# sourceMappingURL=editSessionsFileSystemProvider.js.map