/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/platform", "vs/platform/files/common/diskFileSystemProvider", "vs/platform/files/common/diskFileSystemProviderClient", "vs/workbench/services/files/electron-sandbox/watcherClient"], function (require, exports, platform_1, diskFileSystemProvider_1, diskFileSystemProviderClient_1, watcherClient_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.DiskFileSystemProvider = void 0;
    /**
     * A sandbox ready disk file system provider that delegates almost all calls
     * to the main process via `DiskFileSystemProviderServer` except for recursive
     * file watching that is done via shared process workers due to CPU intensity.
     */
    class DiskFileSystemProvider extends diskFileSystemProvider_1.AbstractDiskFileSystemProvider {
        constructor(mainProcessService, utilityProcessWorkerWorkbenchService, logService) {
            super(logService, { watcher: { forceUniversal: true /* send all requests to universal watcher process */ } });
            this.mainProcessService = mainProcessService;
            this.utilityProcessWorkerWorkbenchService = utilityProcessWorkerWorkbenchService;
            this.provider = this._register(new diskFileSystemProviderClient_1.DiskFileSystemProviderClient(this.mainProcessService.getChannel(diskFileSystemProviderClient_1.LOCAL_FILE_SYSTEM_CHANNEL_NAME), { pathCaseSensitive: platform_1.isLinux, trash: true }));
            this.registerListeners();
        }
        registerListeners() {
            // Forward events from the embedded provider
            this.provider.onDidChangeFile(changes => this._onDidChangeFile.fire(changes));
            this.provider.onDidWatchError(error => this._onDidWatchError.fire(error));
        }
        //#region File Capabilities
        get onDidChangeCapabilities() { return this.provider.onDidChangeCapabilities; }
        get capabilities() { return this.provider.capabilities; }
        //#endregion
        //#region File Metadata Resolving
        stat(resource) {
            return this.provider.stat(resource);
        }
        readdir(resource) {
            return this.provider.readdir(resource);
        }
        //#endregion
        //#region File Reading/Writing
        readFile(resource, opts) {
            return this.provider.readFile(resource, opts);
        }
        readFileStream(resource, opts, token) {
            return this.provider.readFileStream(resource, opts, token);
        }
        writeFile(resource, content, opts) {
            return this.provider.writeFile(resource, content, opts);
        }
        open(resource, opts) {
            return this.provider.open(resource, opts);
        }
        close(fd) {
            return this.provider.close(fd);
        }
        read(fd, pos, data, offset, length) {
            return this.provider.read(fd, pos, data, offset, length);
        }
        write(fd, pos, data, offset, length) {
            return this.provider.write(fd, pos, data, offset, length);
        }
        //#endregion
        //#region Move/Copy/Delete/Create Folder
        mkdir(resource) {
            return this.provider.mkdir(resource);
        }
        delete(resource, opts) {
            return this.provider.delete(resource, opts);
        }
        rename(from, to, opts) {
            return this.provider.rename(from, to, opts);
        }
        copy(from, to, opts) {
            return this.provider.copy(from, to, opts);
        }
        //#endregion
        //#region Clone File
        cloneFile(from, to) {
            return this.provider.cloneFile(from, to);
        }
        //#endregion
        //#region File Watching
        createUniversalWatcher(onChange, onLogMessage, verboseLogging) {
            return new watcherClient_1.UniversalWatcherClient(changes => onChange(changes), msg => onLogMessage(msg), verboseLogging, this.utilityProcessWorkerWorkbenchService);
        }
        createNonRecursiveWatcher() {
            throw new Error('Method not implemented in sandbox.'); // we never expect this to be called given we set `forceUniversal: true`
        }
    }
    exports.DiskFileSystemProvider = DiskFileSystemProvider;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZGlza0ZpbGVTeXN0ZW1Qcm92aWRlci5qcyIsInNvdXJjZVJvb3QiOiJmaWxlOi8vL3dvcmtzcGFjZS9hcHBmbG93L3NyYy8iLCJzb3VyY2VzIjpbInZzL3dvcmtiZW5jaC9zZXJ2aWNlcy9maWxlcy9lbGVjdHJvbi1zYW5kYm94L2Rpc2tGaWxlU3lzdGVtUHJvdmlkZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7O0lBZ0JoRzs7OztPQUlHO0lBQ0gsTUFBYSxzQkFBdUIsU0FBUSx1REFBOEI7UUFVekUsWUFDa0Isa0JBQXVDLEVBQ3ZDLG9DQUEyRSxFQUM1RixVQUF1QjtZQUV2QixLQUFLLENBQUMsVUFBVSxFQUFFLEVBQUUsT0FBTyxFQUFFLEVBQUUsY0FBYyxFQUFFLElBQUksQ0FBQyxvREFBb0QsRUFBRSxFQUFFLENBQUMsQ0FBQztZQUo3Rix1QkFBa0IsR0FBbEIsa0JBQWtCLENBQXFCO1lBQ3ZDLHlDQUFvQyxHQUFwQyxvQ0FBb0MsQ0FBdUM7WUFKNUUsYUFBUSxHQUFHLElBQUksQ0FBQyxTQUFTLENBQUMsSUFBSSwyREFBNEIsQ0FBQyxJQUFJLENBQUMsa0JBQWtCLENBQUMsVUFBVSxDQUFDLDZEQUE4QixDQUFDLEVBQUUsRUFBRSxpQkFBaUIsRUFBRSxrQkFBTyxFQUFFLEtBQUssRUFBRSxJQUFJLEVBQUUsQ0FBQyxDQUFDLENBQUM7WUFTN0wsSUFBSSxDQUFDLGlCQUFpQixFQUFFLENBQUM7UUFDMUIsQ0FBQztRQUVPLGlCQUFpQjtZQUV4Qiw0Q0FBNEM7WUFDNUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxlQUFlLENBQUMsT0FBTyxDQUFDLEVBQUUsQ0FBQyxJQUFJLENBQUMsZ0JBQWdCLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUM7WUFDOUUsSUFBSSxDQUFDLFFBQVEsQ0FBQyxlQUFlLENBQUMsS0FBSyxDQUFDLEVBQUUsQ0FBQyxJQUFJLENBQUMsZ0JBQWdCLENBQUMsSUFBSSxDQUFDLEtBQUss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