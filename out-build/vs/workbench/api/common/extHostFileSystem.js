/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/uri", "./extHost.protocol", "vs/base/common/lifecycle", "vs/workbench/api/common/extHostTypes", "vs/workbench/api/common/extHostTypeConverters", "vs/editor/common/languages/linkComputer", "vs/base/common/strings", "vs/base/common/buffer", "vs/workbench/services/extensions/common/extensions", "vs/base/common/htmlContent"], function (require, exports, uri_1, extHost_protocol_1, lifecycle_1, extHostTypes_1, typeConverter, linkComputer_1, strings_1, buffer_1, extensions_1, htmlContent_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$Ubc = void 0;
    class FsLinkProvider {
        constructor() {
            this.a = [];
        }
        add(scheme) {
            this.b = undefined;
            this.a.push(scheme);
        }
        delete(scheme) {
            const idx = this.a.indexOf(scheme);
            if (idx >= 0) {
                this.a.splice(idx, 1);
                this.b = undefined;
            }
        }
        c() {
            if (!this.b) {
                // sort and compute common prefix with previous scheme
                // then build state transitions based on the data
                const schemes = this.a.sort();
                const edges = [];
                let prevScheme;
                let prevState;
                let lastState = 14 /* State.LastKnownState */;
                let nextState = 14 /* State.LastKnownState */;
                for (const scheme of schemes) {
                    // skip the common prefix of the prev scheme
                    // and continue with its last state
                    let pos = !prevScheme ? 0 : (0, strings_1.$Oe)(prevScheme, scheme);
                    if (pos === 0) {
                        prevState = 1 /* State.Start */;
                    }
                    else {
                        prevState = nextState;
                    }
                    for (; pos < scheme.length; pos++) {
                        // keep creating new (next) states until the
                        // end (and the BeforeColon-state) is reached
                        if (pos + 1 === scheme.length) {
                            // Save the last state here, because we need to continue for the next scheme
                            lastState = nextState;
                            nextState = 9 /* State.BeforeColon */;
                        }
                        else {
                            nextState += 1;
                        }
                        edges.push([prevState, scheme.toUpperCase().charCodeAt(pos), nextState]);
                        edges.push([prevState, scheme.toLowerCase().charCodeAt(pos), nextState]);
                        prevState = nextState;
                    }
                    prevScheme = scheme;
                    // Restore the last state
                    nextState = lastState;
                }
                // all link must match this pattern `<scheme>:/<more>`
                edges.push([9 /* State.BeforeColon */, 58 /* CharCode.Colon */, 10 /* State.AfterColon */]);
                edges.push([10 /* State.AfterColon */, 47 /* CharCode.Slash */, 12 /* State.End */]);
                this.b = new linkComputer_1.$yY(edges);
            }
        }
        provideDocumentLinks(document) {
            this.c();
            const result = [];
            const links = linkComputer_1.$zY.computeLinks({
                getLineContent(lineNumber) {
                    return document.lineAt(lineNumber - 1).text;
                },
                getLineCount() {
                    return document.lineCount;
                }
            }, this.b);
            for (const link of links) {
                const docLink = typeConverter.DocumentLink.to(link);
                if (docLink.target) {
                    result.push(docLink);
                }
            }
            return result;
        }
    }
    class $Ubc {
        constructor(mainContext, i) {
            this.i = i;
            this.b = new FsLinkProvider();
            this.c = new Map();
            this.d = new Set();
            this.f = new Map();
            this.h = 0;
            this.a = mainContext.getProxy(extHost_protocol_1.$1J.MainThreadFileSystem);
        }
        dispose() {
            this.g?.dispose();
        }
        registerFileSystemProvider(extension, scheme, provider, options = {}) {
            // validate the given provider is complete
            $Ubc.j(provider);
            if (this.d.has(scheme)) {
                throw new Error(`a provider for the scheme '${scheme}' is already registered`);
            }
            //
            if (!this.g) {
                this.g = this.i.registerDocumentLinkProvider(extension, '*', this.b);
            }
            const handle = this.h++;
            this.b.add(scheme);
            this.d.add(scheme);
            this.c.set(handle, provider);
            let capabilities = 2 /* files.FileSystemProviderCapabilities.FileReadWrite */;
            if (options.isCaseSensitive) {
                capabilities += 1024 /* files.FileSystemProviderCapabilities.PathCaseSensitive */;
            }
            if (options.isReadonly) {
                capabilities += 2048 /* files.FileSystemProviderCapabilities.Readonly */;
            }
            if (typeof provider.copy === 'function') {
                capabilities += 8 /* files.FileSystemProviderCapabilities.FileFolderCopy */;
            }
            if (typeof provider.open === 'function' && typeof provider.close === 'function'
                && typeof provider.read === 'function' && typeof provider.write === 'function') {
                (0, extensions_1.$QF)(extension, 'fsChunks');
                capabilities += 4 /* files.FileSystemProviderCapabilities.FileOpenReadWriteClose */;
            }
            let readOnlyMessage;
            if (options.isReadonly && (0, htmlContent_1.$Zj)(options.isReadonly)) {
                (0, extensions_1.$QF)(extension, 'readonlyMessage');
                readOnlyMessage = {
                    value: options.isReadonly.value,
                    isTrusted: options.isReadonly.isTrusted,
                    supportThemeIcons: options.isReadonly.supportThemeIcons,
                    supportHtml: options.isReadonly.supportHtml,
                    baseUri: options.isReadonly.baseUri,
                    uris: options.isReadonly.uris
                };
            }
            this.a.$registerFileSystemProvider(handle, scheme, capabilities, readOnlyMessage).catch(err => {
                console.error(`FAILED to register filesystem provider of ${extension.identifier.value}-extension for the scheme ${scheme}`);
                console.error(err);
            });
            const subscription = provider.onDidChangeFile(event => {
                const mapped = [];
                for (const e of event) {
                    const { uri: resource, type } = e;
                    if (resource.scheme !== scheme) {
                        // dropping events for wrong scheme
                        continue;
                    }
                    let newType;
                    switch (type) {
                        case extHostTypes_1.FileChangeType.Changed:
                            newType = 0 /* files.FileChangeType.UPDATED */;
                            break;
                        case extHostTypes_1.FileChangeType.Created:
                            newType = 1 /* files.FileChangeType.ADDED */;
                            break;
                        case extHostTypes_1.FileChangeType.Deleted:
                            newType = 2 /* files.FileChangeType.DELETED */;
                            break;
                        default:
                            throw new Error('Unknown FileChangeType');
                    }
                    mapped.push({ resource, type: newType });
                }
                this.a.$onFileSystemChange(handle, mapped);
            });
            return (0, lifecycle_1.$ic)(() => {
                subscription.dispose();
                this.b.delete(scheme);
                this.d.delete(scheme);
                this.c.delete(handle);
                this.a.$unregisterProvider(handle);
            });
        }
        static j(provider) {
            if (!provider) {
                throw new Error('MISSING provider');
            }
            if (typeof provider.watch !== 'function') {
                throw new Error('Provider does NOT implement watch');
            }
            if (typeof provider.stat !== 'function') {
                throw new Error('Provider does NOT implement stat');
            }
            if (typeof provider.readDirectory !== 'function') {
                throw new Error('Provider does NOT implement readDirectory');
            }
            if (typeof provider.createDirectory !== 'function') {
                throw new Error('Provider does NOT implement createDirectory');
            }
            if (typeof provider.readFile !== 'function') {
                throw new Error('Provider does NOT implement readFile');
            }
            if (typeof provider.writeFile !== 'function') {
                throw new Error('Provider does NOT implement writeFile');
            }
            if (typeof provider.delete !== 'function') {
                throw new Error('Provider does NOT implement delete');
            }
            if (typeof provider.rename !== 'function') {
                throw new Error('Provider does NOT implement rename');
            }
        }
        static k(stat) {
            const { type, ctime, mtime, size, permissions } = stat;
            return { type, ctime, mtime, size, permissions };
        }
        $stat(handle, resource) {
            return Promise.resolve(this.l(handle).stat(uri_1.URI.revive(resource))).then(stat => $Ubc.k(stat));
        }
        $readdir(handle, resource) {
            return Promise.resolve(this.l(handle).readDirectory(uri_1.URI.revive(resource)));
        }
        $readFile(handle, resource) {
            return Promise.resolve(this.l(handle).readFile(uri_1.URI.revive(resource))).then(data => buffer_1.$Fd.wrap(data));
        }
        $writeFile(handle, resource, content, opts) {
            return Promise.resolve(this.l(handle).writeFile(uri_1.URI.revive(resource), content.buffer, opts));
        }
        $delete(handle, resource, opts) {
            return Promise.resolve(this.l(handle).delete(uri_1.URI.revive(resource), opts));
        }
        $rename(handle, oldUri, newUri, opts) {
            return Promise.resolve(this.l(handle).rename(uri_1.URI.revive(oldUri), uri_1.URI.revive(newUri), opts));
        }
        $copy(handle, oldUri, newUri, opts) {
            const provider = this.l(handle);
            if (!provider.copy) {
                throw new Error('FileSystemProvider does not implement "copy"');
            }
            return Promise.resolve(provider.copy(uri_1.URI.revive(oldUri), uri_1.URI.revive(newUri), opts));
        }
        $mkdir(handle, resource) {
            return Promise.resolve(this.l(handle).createDirectory(uri_1.URI.revive(resource)));
        }
        $watch(handle, session, resource, opts) {
            const subscription = this.l(handle).watch(uri_1.URI.revive(resource), opts);
            this.f.set(session, subscription);
        }
        $unwatch(_handle, session) {
            const subscription = this.f.get(session);
            if (subscription) {
                subscription.dispose();
                this.f.delete(session);
            }
        }
        $open(handle, resource, opts) {
            const provider = this.l(handle);
            if (!provider.open) {
                throw new Error('FileSystemProvider does not implement "open"');
            }
            return Promise.resolve(provider.open(uri_1.URI.revive(resource), opts));
        }
        $close(handle, fd) {
            const provider = this.l(handle);
            if (!provider.close) {
                throw new Error('FileSystemProvider does not implement "close"');
            }
            return Promise.resolve(provider.close(fd));
        }
        $read(handle, fd, pos, length) {
            const provider = this.l(handle);
            if (!provider.read) {
                throw new Error('FileSystemProvider does not implement "read"');
            }
            const data = buffer_1.$Fd.alloc(length);
            return Promise.resolve(provider.read(fd, pos, data.buffer, 0, length)).then(read => {
                return data.slice(0, read); // don't send zeros
            });
        }
        $write(handle, fd, pos, data) {
            const provider = this.l(handle);
            if (!provider.write) {
                throw new Error('FileSystemProvider does not implement "write"');
            }
            return Promise.resolve(provider.write(fd, pos, data.buffer, 0, data.byteLength));
        }
        l(handle) {
            const provider = this.c.get(handle);
            if (!provider) {
                const err = new Error();
                err.name = 'ENOPRO';
                err.message = `no provider`;
                throw err;
            }
            return provider;
        }
    }
    exports.$Ubc = $Ubc;
});
//# sourceMappingURL=extHostFileSystem.js.map