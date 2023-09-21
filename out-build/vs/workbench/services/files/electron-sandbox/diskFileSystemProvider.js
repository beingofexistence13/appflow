/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/platform", "vs/platform/files/common/diskFileSystemProvider", "vs/platform/files/common/diskFileSystemProviderClient", "vs/workbench/services/files/electron-sandbox/watcherClient"], function (require, exports, platform_1, diskFileSystemProvider_1, diskFileSystemProviderClient_1, watcherClient_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$a_b = void 0;
    /**
     * A sandbox ready disk file system provider that delegates almost all calls
     * to the main process via `DiskFileSystemProviderServer` except for recursive
     * file watching that is done via shared process workers due to CPU intensity.
     */
    class $a_b extends diskFileSystemProvider_1.$Mp {
        constructor(I, J, logService) {
            super(logService, { watcher: { forceUniversal: true /* send all requests to universal watcher process */ } });
            this.I = I;
            this.J = J;
            this.f = this.B(new diskFileSystemProviderClient_1.$8M(this.I.getChannel(diskFileSystemProviderClient_1.$7M), { pathCaseSensitive: platform_1.$k, trash: true }));
            this.L();
        }
        L() {
            // Forward events from the embedded provider
            this.f.onDidChangeFile(changes => this.c.fire(changes));
            this.f.onDidWatchError(error => this.g.fire(error));
        }
        //#region File Capabilities
        get onDidChangeCapabilities() { return this.f.onDidChangeCapabilities; }
        get capabilities() { return this.f.capabilities; }
        //#endregion
        //#region File Metadata Resolving
        stat(resource) {
            return this.f.stat(resource);
        }
        readdir(resource) {
            return this.f.readdir(resource);
        }
        //#endregion
        //#region File Reading/Writing
        readFile(resource, opts) {
            return this.f.readFile(resource, opts);
        }
        readFileStream(resource, opts, token) {
            return this.f.readFileStream(resource, opts, token);
        }
        writeFile(resource, content, opts) {
            return this.f.writeFile(resource, content, opts);
        }
        open(resource, opts) {
            return this.f.open(resource, opts);
        }
        close(fd) {
            return this.f.close(fd);
        }
        read(fd, pos, data, offset, length) {
            return this.f.read(fd, pos, data, offset, length);
        }
        write(fd, pos, data, offset, length) {
            return this.f.write(fd, pos, data, offset, length);
        }
        //#endregion
        //#region Move/Copy/Delete/Create Folder
        mkdir(resource) {
            return this.f.mkdir(resource);
        }
        delete(resource, opts) {
            return this.f.delete(resource, opts);
        }
        rename(from, to, opts) {
            return this.f.rename(from, to, opts);
        }
        copy(from, to, opts) {
            return this.f.copy(from, to, opts);
        }
        //#endregion
        //#region Clone File
        cloneFile(from, to) {
            return this.f.cloneFile(from, to);
        }
        //#endregion
        //#region File Watching
        t(onChange, onLogMessage, verboseLogging) {
            return new watcherClient_1.$_$b(changes => onChange(changes), msg => onLogMessage(msg), verboseLogging, this.J);
        }
        F() {
            throw new Error('Method not implemented in sandbox.'); // we never expect this to be called given we set `forceUniversal: true`
        }
    }
    exports.$a_b = $a_b;
});
//# sourceMappingURL=diskFileSystemProvider.js.map