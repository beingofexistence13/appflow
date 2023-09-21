/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/platform/files/common/files", "vs/base/common/event", "vs/base/common/lifecycle", "vs/base/common/errors"], function (require, exports, files_1, event_1, lifecycle_1, errors_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.FetchFileSystemProvider = void 0;
    class FetchFileSystemProvider {
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
                throw (0, files_1.createFileSystemProviderError)(res.statusText, files_1.FileSystemProviderErrorCode.Unknown);
            }
            catch (err) {
                throw (0, files_1.createFileSystemProviderError)(err, files_1.FileSystemProviderErrorCode.Unknown);
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
            return lifecycle_1.Disposable.None;
        }
        // error implementations
        writeFile(_resource, _content, _opts) {
            throw new errors_1.NotSupportedError();
        }
        readdir(_resource) {
            throw new errors_1.NotSupportedError();
        }
        mkdir(_resource) {
            throw new errors_1.NotSupportedError();
        }
        delete(_resource, _opts) {
            throw new errors_1.NotSupportedError();
        }
        rename(_from, _to, _opts) {
            throw new errors_1.NotSupportedError();
        }
    }
    exports.FetchFileSystemProvider = FetchFileSystemProvider;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoid2ViV29ya2VyRmlsZVN5c3RlbVByb3ZpZGVyLmpzIiwic291cmNlUm9vdCI6ImZpbGU6Ly8vd29ya3NwYWNlL2FwcGZsb3cvc3JjLyIsInNvdXJjZXMiOlsidnMvd29ya2JlbmNoL3NlcnZpY2VzL2V4dGVuc2lvbnMvYnJvd3Nlci93ZWJXb3JrZXJGaWxlU3lzdGVtUHJvdmlkZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7O0lBUWhHLE1BQWEsdUJBQXVCO1FBQXBDO1lBRVUsaUJBQVksR0FBRyx5R0FBc0YsOERBQW1ELENBQUM7WUFDekosNEJBQXVCLEdBQUcsYUFBSyxDQUFDLElBQUksQ0FBQztZQUNyQyxvQkFBZSxHQUFHLGFBQUssQ0FBQyxJQUFJLENBQUM7UUE2Q3ZDLENBQUM7UUEzQ0EsMEJBQTBCO1FBQzFCLEtBQUssQ0FBQyxRQUFRLENBQUMsUUFBYTtZQUMzQixJQUFJO2dCQUNILE1BQU0sR0FBRyxHQUFHLE1BQU0sS0FBSyxDQUFDLFFBQVEsQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQztnQkFDakQsSUFBSSxHQUFHLENBQUMsTUFBTSxLQUFLLEdBQUcsRUFBRTtvQkFDdkIsT0FBTyxJQUFJLFVBQVUsQ0FBQyxNQUFNLEdBQUcsQ0FBQyxXQUFXLEVBQUUsQ0FBQyxDQUFDO2lCQUMvQztnQkFDRCxNQUFNLElBQUEscUNBQTZCLEVBQUMsR0FBRyxDQUFDLFVBQVUsRUFBRSxtQ0FBMkIsQ0FBQyxPQUFPLENBQUMsQ0FBQzthQUN6RjtZQUFDLE9BQU8sR0FBRyxFQUFFO2dCQUNiLE1BQU0sSUFBQSxxQ0FBNkIsRUFBQyxHQUFHLEVBQUUsbUNBQTJCLENBQUMsT0FBTyxDQUFDLENBQUM7YUFDOUU7UUFDRixDQUFDO1FBRUQsdUJBQXVCO1FBQ3ZCLEtBQUssQ0FBQyxJQUFJLENBQUMsU0FBYztZQUN4QixPQUFPO2dCQUNOLElBQUksRUFBRSxnQkFBUSxDQUFDLElBQUk7Z0JBQ25CLElBQUksRUFBRSxDQUFDO2dCQUNQLEtBQUssRUFBRSxDQUFDO2dCQUNSLEtBQUssRUFBRSxDQUFDO2FBQ1IsQ0FBQztRQUNILENBQUM7UUFFRCxLQUFLO1lBQ0osT0FBTyxzQkFBVSxDQUFDLElBQUksQ0FBQztRQUN4QixDQUFDO1FBRUQsd0JBQXdCO1FBQ3hCLFNBQVMsQ0FBQyxTQUFjLEVBQUUsUUFBb0IsRUFBRSxLQUF3QjtZQUN2RSxNQUFNLElBQUksMEJBQWlCLEVBQUUsQ0FBQztRQUMvQixDQUFDO1FBQ0QsT0FBTyxDQUFDLFNBQWM7WUFDckIsTUFBTSxJQUFJLDBCQUFpQixFQUFFLENBQUM7UUFDL0IsQ0FBQztRQUNELEtBQUssQ0FBQyxTQUFjO1lBQ25CLE1BQU0sSUFBSSwwQkFBaUIsRUFBRSxDQUFDO1FBQy9CLENBQUM7UUFDRCxNQUFNLENBQUMsU0FBYyxFQUFFLEtBQXlCO1lBQy9DLE1BQU0sSUFBSSwwQkFBaUIsRUFBRSxDQUFDO1FBQy9CLENBQUM7UUFDRCxNQUFNLENBQUMsS0FBVSxFQUFFLEdBQVEsRUFBRSxLQUE0QjtZQUN4RCxNQUFNLElBQUksMEJBQWlCLEVBQUUsQ0FBQztRQUMvQixDQUFDO0tBQ0Q7SUFqREQsMERBaURDIn0=