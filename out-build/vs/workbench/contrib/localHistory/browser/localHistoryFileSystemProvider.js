/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/event", "vs/base/common/lifecycle", "vs/base/common/uri", "vs/platform/files/common/files", "vs/base/common/resources", "vs/base/common/buffer"], function (require, exports, event_1, lifecycle_1, uri_1, files_1, resources_1, buffer_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$x1b = void 0;
    /**
     * A wrapper around a standard file system provider
     * that is entirely readonly.
     */
    class $x1b {
        static { this.SCHEMA = 'vscode-local-history'; }
        static toLocalHistoryFileSystem(resource) {
            const serializedLocalHistoryResource = {
                location: resource.location.toString(true),
                associatedResource: resource.associatedResource.toString(true)
            };
            // Try to preserve the associated resource as much as possible
            // and only keep the `query` part dynamic. This enables other
            // components (e.g. other timeline providers) to continue
            // providing timeline entries even when our resource is active.
            return resource.associatedResource.with({
                scheme: $x1b.SCHEMA,
                query: JSON.stringify(serializedLocalHistoryResource)
            });
        }
        static fromLocalHistoryFileSystem(resource) {
            const serializedLocalHistoryResource = JSON.parse(resource.query);
            return {
                location: uri_1.URI.parse(serializedLocalHistoryResource.location),
                associatedResource: uri_1.URI.parse(serializedLocalHistoryResource.associatedResource)
            };
        }
        static { this.a = uri_1.URI.from({ scheme: $x1b.SCHEMA, path: '/empty' }); }
        static { this.EMPTY = {
            location: $x1b.a,
            associatedResource: $x1b.a
        }; }
        get capabilities() {
            return 2 /* FileSystemProviderCapabilities.FileReadWrite */ | 2048 /* FileSystemProviderCapabilities.Readonly */;
        }
        constructor(b) {
            this.b = b;
            this.c = new Map();
            //#endregion
            //#region Unsupported File Operations
            this.onDidChangeCapabilities = event_1.Event.None;
            this.onDidChangeFile = event_1.Event.None;
        }
        async d(resource) {
            const scheme = resource.scheme;
            let providerPromise = this.c.get(scheme);
            if (!providerPromise) {
                // Resolve early when provider already exists
                const provider = this.b.getProvider(scheme);
                if (provider) {
                    providerPromise = Promise.resolve(provider);
                }
                // Otherwise wait for registration
                else {
                    providerPromise = new Promise(resolve => {
                        const disposable = this.b.onDidChangeFileSystemProviderRegistrations(e => {
                            if (e.added && e.provider && e.scheme === scheme) {
                                disposable.dispose();
                                resolve(e.provider);
                            }
                        });
                    });
                }
                this.c.set(scheme, providerPromise);
            }
            return providerPromise;
        }
        //#region Supported File Operations
        async stat(resource) {
            const location = $x1b.fromLocalHistoryFileSystem(resource).location;
            // Special case: empty resource
            if ((0, resources_1.$bg)($x1b.a, location)) {
                return { type: files_1.FileType.File, ctime: 0, mtime: 0, size: 0 };
            }
            // Otherwise delegate to provider
            return (await this.d(location)).stat(location);
        }
        async readFile(resource) {
            const location = $x1b.fromLocalHistoryFileSystem(resource).location;
            // Special case: empty resource
            if ((0, resources_1.$bg)($x1b.a, location)) {
                return buffer_1.$Fd.fromString('').buffer;
            }
            // Otherwise delegate to provider
            const provider = await this.d(location);
            if ((0, files_1.$8j)(provider)) {
                return provider.readFile(location);
            }
            throw new Error('Unsupported');
        }
        async writeFile(resource, content, opts) { }
        async mkdir(resource) { }
        async readdir(resource) { return []; }
        async rename(from, to, opts) { }
        async delete(resource, opts) { }
        watch(resource, opts) { return lifecycle_1.$kc.None; }
    }
    exports.$x1b = $x1b;
});
//# sourceMappingURL=localHistoryFileSystemProvider.js.map