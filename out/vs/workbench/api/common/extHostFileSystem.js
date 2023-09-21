/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/uri", "./extHost.protocol", "vs/base/common/lifecycle", "vs/workbench/api/common/extHostTypes", "vs/workbench/api/common/extHostTypeConverters", "vs/editor/common/languages/linkComputer", "vs/base/common/strings", "vs/base/common/buffer", "vs/workbench/services/extensions/common/extensions", "vs/base/common/htmlContent"], function (require, exports, uri_1, extHost_protocol_1, lifecycle_1, extHostTypes_1, typeConverter, linkComputer_1, strings_1, buffer_1, extensions_1, htmlContent_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.ExtHostFileSystem = void 0;
    class FsLinkProvider {
        constructor() {
            this._schemes = [];
        }
        add(scheme) {
            this._stateMachine = undefined;
            this._schemes.push(scheme);
        }
        delete(scheme) {
            const idx = this._schemes.indexOf(scheme);
            if (idx >= 0) {
                this._schemes.splice(idx, 1);
                this._stateMachine = undefined;
            }
        }
        _initStateMachine() {
            if (!this._stateMachine) {
                // sort and compute common prefix with previous scheme
                // then build state transitions based on the data
                const schemes = this._schemes.sort();
                const edges = [];
                let prevScheme;
                let prevState;
                let lastState = 14 /* State.LastKnownState */;
                let nextState = 14 /* State.LastKnownState */;
                for (const scheme of schemes) {
                    // skip the common prefix of the prev scheme
                    // and continue with its last state
                    let pos = !prevScheme ? 0 : (0, strings_1.commonPrefixLength)(prevScheme, scheme);
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
                this._stateMachine = new linkComputer_1.StateMachine(edges);
            }
        }
        provideDocumentLinks(document) {
            this._initStateMachine();
            const result = [];
            const links = linkComputer_1.LinkComputer.computeLinks({
                getLineContent(lineNumber) {
                    return document.lineAt(lineNumber - 1).text;
                },
                getLineCount() {
                    return document.lineCount;
                }
            }, this._stateMachine);
            for (const link of links) {
                const docLink = typeConverter.DocumentLink.to(link);
                if (docLink.target) {
                    result.push(docLink);
                }
            }
            return result;
        }
    }
    class ExtHostFileSystem {
        constructor(mainContext, _extHostLanguageFeatures) {
            this._extHostLanguageFeatures = _extHostLanguageFeatures;
            this._linkProvider = new FsLinkProvider();
            this._fsProvider = new Map();
            this._registeredSchemes = new Set();
            this._watches = new Map();
            this._handlePool = 0;
            this._proxy = mainContext.getProxy(extHost_protocol_1.MainContext.MainThreadFileSystem);
        }
        dispose() {
            this._linkProviderRegistration?.dispose();
        }
        registerFileSystemProvider(extension, scheme, provider, options = {}) {
            // validate the given provider is complete
            ExtHostFileSystem._validateFileSystemProvider(provider);
            if (this._registeredSchemes.has(scheme)) {
                throw new Error(`a provider for the scheme '${scheme}' is already registered`);
            }
            //
            if (!this._linkProviderRegistration) {
                this._linkProviderRegistration = this._extHostLanguageFeatures.registerDocumentLinkProvider(extension, '*', this._linkProvider);
            }
            const handle = this._handlePool++;
            this._linkProvider.add(scheme);
            this._registeredSchemes.add(scheme);
            this._fsProvider.set(handle, provider);
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
                (0, extensions_1.checkProposedApiEnabled)(extension, 'fsChunks');
                capabilities += 4 /* files.FileSystemProviderCapabilities.FileOpenReadWriteClose */;
            }
            let readOnlyMessage;
            if (options.isReadonly && (0, htmlContent_1.isMarkdownString)(options.isReadonly)) {
                (0, extensions_1.checkProposedApiEnabled)(extension, 'readonlyMessage');
                readOnlyMessage = {
                    value: options.isReadonly.value,
                    isTrusted: options.isReadonly.isTrusted,
                    supportThemeIcons: options.isReadonly.supportThemeIcons,
                    supportHtml: options.isReadonly.supportHtml,
                    baseUri: options.isReadonly.baseUri,
                    uris: options.isReadonly.uris
                };
            }
            this._proxy.$registerFileSystemProvider(handle, scheme, capabilities, readOnlyMessage).catch(err => {
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
                this._proxy.$onFileSystemChange(handle, mapped);
            });
            return (0, lifecycle_1.toDisposable)(() => {
                subscription.dispose();
                this._linkProvider.delete(scheme);
                this._registeredSchemes.delete(scheme);
                this._fsProvider.delete(handle);
                this._proxy.$unregisterProvider(handle);
            });
        }
        static _validateFileSystemProvider(provider) {
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
        static _asIStat(stat) {
            const { type, ctime, mtime, size, permissions } = stat;
            return { type, ctime, mtime, size, permissions };
        }
        $stat(handle, resource) {
            return Promise.resolve(this._getFsProvider(handle).stat(uri_1.URI.revive(resource))).then(stat => ExtHostFileSystem._asIStat(stat));
        }
        $readdir(handle, resource) {
            return Promise.resolve(this._getFsProvider(handle).readDirectory(uri_1.URI.revive(resource)));
        }
        $readFile(handle, resource) {
            return Promise.resolve(this._getFsProvider(handle).readFile(uri_1.URI.revive(resource))).then(data => buffer_1.VSBuffer.wrap(data));
        }
        $writeFile(handle, resource, content, opts) {
            return Promise.resolve(this._getFsProvider(handle).writeFile(uri_1.URI.revive(resource), content.buffer, opts));
        }
        $delete(handle, resource, opts) {
            return Promise.resolve(this._getFsProvider(handle).delete(uri_1.URI.revive(resource), opts));
        }
        $rename(handle, oldUri, newUri, opts) {
            return Promise.resolve(this._getFsProvider(handle).rename(uri_1.URI.revive(oldUri), uri_1.URI.revive(newUri), opts));
        }
        $copy(handle, oldUri, newUri, opts) {
            const provider = this._getFsProvider(handle);
            if (!provider.copy) {
                throw new Error('FileSystemProvider does not implement "copy"');
            }
            return Promise.resolve(provider.copy(uri_1.URI.revive(oldUri), uri_1.URI.revive(newUri), opts));
        }
        $mkdir(handle, resource) {
            return Promise.resolve(this._getFsProvider(handle).createDirectory(uri_1.URI.revive(resource)));
        }
        $watch(handle, session, resource, opts) {
            const subscription = this._getFsProvider(handle).watch(uri_1.URI.revive(resource), opts);
            this._watches.set(session, subscription);
        }
        $unwatch(_handle, session) {
            const subscription = this._watches.get(session);
            if (subscription) {
                subscription.dispose();
                this._watches.delete(session);
            }
        }
        $open(handle, resource, opts) {
            const provider = this._getFsProvider(handle);
            if (!provider.open) {
                throw new Error('FileSystemProvider does not implement "open"');
            }
            return Promise.resolve(provider.open(uri_1.URI.revive(resource), opts));
        }
        $close(handle, fd) {
            const provider = this._getFsProvider(handle);
            if (!provider.close) {
                throw new Error('FileSystemProvider does not implement "close"');
            }
            return Promise.resolve(provider.close(fd));
        }
        $read(handle, fd, pos, length) {
            const provider = this._getFsProvider(handle);
            if (!provider.read) {
                throw new Error('FileSystemProvider does not implement "read"');
            }
            const data = buffer_1.VSBuffer.alloc(length);
            return Promise.resolve(provider.read(fd, pos, data.buffer, 0, length)).then(read => {
                return data.slice(0, read); // don't send zeros
            });
        }
        $write(handle, fd, pos, data) {
            const provider = this._getFsProvider(handle);
            if (!provider.write) {
                throw new Error('FileSystemProvider does not implement "write"');
            }
            return Promise.resolve(provider.write(fd, pos, data.buffer, 0, data.byteLength));
        }
        _getFsProvider(handle) {
            const provider = this._fsProvider.get(handle);
            if (!provider) {
                const err = new Error();
                err.name = 'ENOPRO';
                err.message = `no provider`;
                throw err;
            }
            return provider;
        }
    }
    exports.ExtHostFileSystem = ExtHostFileSystem;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZXh0SG9zdEZpbGVTeXN0ZW0uanMiLCJzb3VyY2VSb290IjoiZmlsZTovLy93b3Jrc3BhY2UvYXBwZmxvdy9zcmMvIiwic291cmNlcyI6WyJ2cy93b3JrYmVuY2gvYXBpL2NvbW1vbi9leHRIb3N0RmlsZVN5c3RlbS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O2dHQUdnRzs7Ozs7SUFrQmhHLE1BQU0sY0FBYztRQUFwQjtZQUVTLGFBQVEsR0FBYSxFQUFFLENBQUM7UUF1RmpDLENBQUM7UUFwRkEsR0FBRyxDQUFDLE1BQWM7WUFDakIsSUFBSSxDQUFDLGFBQWEsR0FBRyxTQUFTLENBQUM7WUFDL0IsSUFBSSxDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUM7UUFDNUIsQ0FBQztRQUVELE1BQU0sQ0FBQyxNQUFjO1lBQ3BCLE1BQU0sR0FBRyxHQUFHLElBQUksQ0FBQyxRQUFRLENBQUMsT0FBTyxDQUFDLE1BQU0sQ0FBQyxDQUFDO1lBQzFDLElBQUksR0FBRyxJQUFJLENBQUMsRUFBRTtnQkFDYixJQUFJLENBQUMsUUFBUSxDQUFDLE1BQU0sQ0FBQyxHQUFHLEVBQUUsQ0FBQyxDQUFDLENBQUM7Z0JBQzdCLElBQUksQ0FBQyxhQUFhLEdBQUcsU0FBUyxDQUFDO2FBQy9CO1FBQ0YsQ0FBQztRQUVPLGlCQUFpQjtZQUN4QixJQUFJLENBQUMsSUFBSSxDQUFDLGFBQWEsRUFBRTtnQkFFeEIsc0RBQXNEO2dCQUN0RCxpREFBaUQ7Z0JBQ2pELE1BQU0sT0FBTyxHQUFHLElBQUksQ0FBQyxRQUFRLENBQUMsSUFBSSxFQUFFLENBQUM7Z0JBQ3JDLE1BQU0sS0FBSyxHQUFXLEVBQUUsQ0FBQztnQkFDekIsSUFBSSxVQUE4QixDQUFDO2dCQUNuQyxJQUFJLFNBQWdCLENBQUM7Z0JBQ3JCLElBQUksU0FBUyxnQ0FBdUIsQ0FBQztnQkFDckMsSUFBSSxTQUFTLGdDQUF1QixDQUFDO2dCQUNyQyxLQUFLLE1BQU0sTUFBTSxJQUFJLE9BQU8s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