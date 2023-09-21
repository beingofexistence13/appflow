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
    exports.EditSessionsFileSystemProvider = void 0;
    let EditSessionsFileSystemProvider = class EditSessionsFileSystemProvider {
        static { this.SCHEMA = editSessions_1.EDIT_SESSIONS_SCHEME; }
        constructor(editSessionsStorageService) {
            this.editSessionsStorageService = editSessionsStorageService;
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
            const data = await this.editSessionsStorageService.read('editSessions', ref);
            if (!data) {
                throw files_1.FileSystemProviderErrorCode.FileNotFound;
            }
            const content = JSON.parse(data.content);
            const change = content.folders.find((f) => f.name === folderName)?.workingChanges.find((change) => change.relativeFilePath === filePath);
            if (!change || change.type === editSessions_1.ChangeType.Deletion) {
                throw files_1.FileSystemProviderErrorCode.FileNotFound;
            }
            return (0, editSessions_1.decodeEditSessionFileContent)(content.version, change.contents).buffer;
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
        watch(resource, opts) { return lifecycle_1.Disposable.None; }
        async mkdir(resource) { }
        async readdir(resource) { return []; }
        async rename(from, to, opts) { }
        async delete(resource, opts) { }
        async writeFile() {
            throw new errors_1.NotSupportedError();
        }
    };
    exports.EditSessionsFileSystemProvider = EditSessionsFileSystemProvider;
    exports.EditSessionsFileSystemProvider = EditSessionsFileSystemProvider = __decorate([
        __param(0, editSessions_1.IEditSessionsStorageService)
    ], EditSessionsFileSystemProvider);
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZWRpdFNlc3Npb25zRmlsZVN5c3RlbVByb3ZpZGVyLmpzIiwic291cmNlUm9vdCI6ImZpbGU6Ly8vd29ya3NwYWNlL2FwcGZsb3cvc3JjLyIsInNvdXJjZXMiOlsidnMvd29ya2JlbmNoL2NvbnRyaWIvZWRpdFNlc3Npb25zL2Jyb3dzZXIvZWRpdFNlc3Npb25zRmlsZVN5c3RlbVByb3ZpZGVyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Z0dBR2dHOzs7Ozs7Ozs7Ozs7OztJQVN6RixJQUFNLDhCQUE4QixHQUFwQyxNQUFNLDhCQUE4QjtpQkFFMUIsV0FBTSxHQUFHLG1DQUFvQixBQUF2QixDQUF3QjtRQUU5QyxZQUM4QiwwQkFBK0Q7WUFBdkQsK0JBQTBCLEdBQTFCLDBCQUEwQixDQUE2QjtZQUdwRixpQkFBWSxHQUFtQyx5R0FBc0YsQ0FBQztZQWdDL0kscUNBQXFDO1lBQzVCLDRCQUF1QixHQUFHLGFBQUssQ0FBQyxJQUFJLENBQUM7WUFDckMsb0JBQWUsR0FBRyxhQUFLLENBQUMsSUFBSSxDQUFDO1FBcENsQyxDQUFDO1FBSUwsS0FBSyxDQUFDLFFBQVEsQ0FBQyxRQUFhO1lBQzNCLE1BQU0sS0FBSyxHQUFHLHNEQUFzRCxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBQ3RHLElBQUksQ0FBQyxLQUFLLEVBQUUsTUFBTSxFQUFFO2dCQUNuQixNQUFNLG1DQUEyQixDQUFDLFlBQVksQ0FBQzthQUMvQztZQUNELE1BQU0sRUFBRSxHQUFHLEVBQUUsVUFBVSxFQUFFLFFBQVEsRUFBRSxHQUFHLEtBQUssQ0FBQyxNQUFNLENBQUM7WUFDbkQsTUFBTSxJQUFJLEdBQUcsTUFBTSxJQUFJLENBQUMsMEJBQTBCLENBQUMsSUFBSSxDQUFDLGNBQWMsRUFBRSxHQUFHLENBQUMsQ0FBQztZQUM3RSxJQUFJLENBQUMsSUFBSSxFQUFFO2dCQUNWLE1BQU0sbUNBQTJCLENBQUMsWUFBWSxDQUFDO2FBQy9DO1lBQ0QsTUFBTSxPQUFPLEdBQWdCLElBQUksQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxDQUFDO1lBQ3RELE1BQU0sTUFBTSxHQUFHLE9BQU8sQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxDQUFDLENBQUMsSUFBSSxLQUFLLFVBQVUsQ0FBQyxFQUFFLGNBQWMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxNQUFNLEVBQUUsRUFBRSxDQUFDLE1BQU0sQ0FBQyxnQkFBZ0IsS0FBSyxRQUFRLENBQUMsQ0FBQztZQUN6SSxJQUFJLENBQUMsTUFBTSxJQUFJLE1BQU0sQ0FBQyxJQUFJLEtBQUsseUJBQVUsQ0FBQyxRQUFRLEVBQUU7Z0JBQ25ELE1BQU0sbUNBQTJCLENBQUMsWUFBWSxDQUFDO2FBQy9DO1lBQ0QsT0FBTyxJQUFBLDJDQUE0QixFQUFDLE9BQU8sQ0FBQyxPQUFPLEVBQUUsTUFBTSxDQUFDLFFBQVEsQ0FBQyxDQUFDLE1BQU0sQ0FBQztRQUM5RSxDQUFDO1FBRUQsS0FBSyxDQUFDLElBQUksQ0FBQyxRQUFhO1lBQ3ZCLE1BQU0sT0FBTyxHQUFHLE1BQU0sSUFBSSxDQUFDLFFBQVEsQ0FBQyxRQUFRLENBQUMsQ0FBQztZQUM5QyxNQUFNLFdBQVcsR0FBRyxJQUFJLENBQUMsR0FBRyxFQUFFLENBQUM7WUFDL0IsT0FBTztnQkFDTixJQUFJLEVBQUUsZ0JBQVEsQ0FBQyxJQUFJO2dCQUNuQixXQUFXLEVBQUUsc0JBQWMsQ0FBQyxRQUFRO2dCQUNwQyxLQUFLLEVBQUUsV0FBVztnQkFDbEIsS0FBSyxFQUFFLFdBQVc7Z0JBQ2xCLElBQUksRUFBRSxPQUFPLENBQUMsVUFBVTthQUN4QixDQUFDO1FBQ0gsQ0FBQztRQU1ELEtBQUssQ0FBQyxRQUFhLEVBQUUsSUFBbUIsSUFBaUIsT0FBTyxzQkFBVSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUM7UUFFbEYsS0FBSyxDQUFDLEtBQUssQ0FBQyxRQUFhLElBQW1CLENBQUM7UUFDN0MsS0FBSyxDQUFDLE9BQU8sQ0FBQyxRQUFhLElBQW1DLE9BQU8sRUFBRSxDQUFDLENBQUMsQ0FBQztRQUUxRSxLQUFLLENBQUMsTUFBTSxDQUFDLElBQVMsRUFBRSxFQUFPLEVBQUUsSUFBMkIsSUFBbUIsQ0FBQztRQUNoRixLQUFLLENBQUMsTUFBTSxDQUFDLFFBQWEsRUFBRSxJQUF3QixJQUFtQixDQUFDO1FBRXhFLEtBQUssQ0FBQyxTQUFTO1lBQ2QsTUFBTSxJQUFJLDBCQUFpQixFQUFFLENBQUM7UUFDL0IsQ0FBQzs7SUF0RFcsd0VBQThCOzZDQUE5Qiw4QkFBOEI7UUFLeEMsV0FBQSwwQ0FBMkIsQ0FBQTtPQUxqQiw4QkFBOEIsQ0F3RDFDIn0=