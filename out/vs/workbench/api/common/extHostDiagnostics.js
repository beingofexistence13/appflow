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
define(["require", "exports", "vs/nls", "vs/platform/markers/common/markers", "vs/base/common/uri", "./extHost.protocol", "./extHostTypes", "./extHostTypeConverters", "vs/base/common/event", "vs/platform/log/common/log", "vs/base/common/map", "vs/workbench/api/common/extHostFileSystemInfo"], function (require, exports, nls_1, markers_1, uri_1, extHost_protocol_1, extHostTypes_1, converter, event_1, log_1, map_1, extHostFileSystemInfo_1) {
    "use strict";
    var ExtHostDiagnostics_1;
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.ExtHostDiagnostics = exports.DiagnosticCollection = void 0;
    class DiagnosticCollection {
        #proxy;
        #onDidChangeDiagnostics;
        #data;
        constructor(_name, _owner, _maxDiagnosticsTotal, _maxDiagnosticsPerFile, _modelVersionIdProvider, extUri, proxy, onDidChangeDiagnostics) {
            this._name = _name;
            this._owner = _owner;
            this._maxDiagnosticsTotal = _maxDiagnosticsTotal;
            this._maxDiagnosticsPerFile = _maxDiagnosticsPerFile;
            this._modelVersionIdProvider = _modelVersionIdProvider;
            this._isDisposed = false;
            this._maxDiagnosticsTotal = Math.max(_maxDiagnosticsPerFile, _maxDiagnosticsTotal);
            this.#data = new map_1.ResourceMap(uri => extUri.getComparisonKey(uri));
            this.#proxy = proxy;
            this.#onDidChangeDiagnostics = onDidChangeDiagnostics;
        }
        dispose() {
            if (!this._isDisposed) {
                this.#onDidChangeDiagnostics.fire([...this.#data.keys()]);
                this.#proxy?.$clear(this._owner);
                this.#data.clear();
                this._isDisposed = true;
            }
        }
        get name() {
            this._checkDisposed();
            return this._name;
        }
        set(first, diagnostics) {
            if (!first) {
                // this set-call is a clear-call
                this.clear();
                return;
            }
            // the actual implementation for #set
            this._checkDisposed();
            let toSync = [];
            if (uri_1.URI.isUri(first)) {
                if (!diagnostics) {
                    // remove this entry
                    this.delete(first);
                    return;
                }
                // update single row
                this.#data.set(first, diagnostics.slice());
                toSync = [first];
            }
            else if (Array.isArray(first)) {
                // update many rows
                toSync = [];
                let lastUri;
                // ensure stable-sort
                first = [...first].sort(DiagnosticCollection._compareIndexedTuplesByUri);
                for (const tuple of first) {
                    const [uri, diagnostics] = tuple;
                    if (!lastUri || uri.toString() !== lastUri.toString()) {
                        if (lastUri && this.#data.get(lastUri).length === 0) {
                            this.#data.delete(lastUri);
                        }
                        lastUri = uri;
                        toSync.push(uri);
                        this.#data.set(uri, []);
                    }
                    if (!diagnostics) {
                        // [Uri, undefined] means clear this
                        const currentDiagnostics = this.#data.get(uri);
                        if (currentDiagnostics) {
                            currentDiagnostics.length = 0;
                        }
                    }
                    else {
                        const currentDiagnostics = this.#data.get(uri);
                        currentDiagnostics?.push(...diagnostics);
                    }
                }
            }
            // send event for extensions
            this.#onDidChangeDiagnostics.fire(toSync);
            // compute change and send to main side
            if (!this.#proxy) {
                return;
            }
            const entries = [];
            let totalMarkerCount = 0;
            for (const uri of toSync) {
                let marker = [];
                const diagnostics = this.#data.get(uri);
                if (diagnostics) {
                    // no more than N diagnostics per file
                    if (diagnostics.length > this._maxDiagnosticsPerFile) {
                        marker = [];
                        const order = [extHostTypes_1.DiagnosticSeverity.Error, extHostTypes_1.DiagnosticSeverity.Warning, extHostTypes_1.DiagnosticSeverity.Information, extHostTypes_1.DiagnosticSeverity.Hint];
                        orderLoop: for (let i = 0; i < 4; i++) {
                            for (const diagnostic of diagnostics) {
                                if (diagnostic.severity === order[i]) {
                                    const len = marker.push({ ...converter.Diagnostic.from(diagnostic), modelVersionId: this._modelVersionIdProvider(uri) });
                                    if (len === this._maxDiagnosticsPerFile) {
                                        break orderLoop;
                                    }
                                }
                            }
                        }
                        // add 'signal' marker for showing omitted errors/warnings
                        marker.push({
                            severity: markers_1.MarkerSeverity.Info,
                            message: (0, nls_1.localize)({ key: 'limitHit', comment: ['amount of errors/warning skipped due to limits'] }, "Not showing {0} further errors and warnings.", diagnostics.length - this._maxDiagnosticsPerFile),
                            startLineNumber: marker[marker.length - 1].startLineNumber,
                            startColumn: marker[marker.length - 1].startColumn,
                            endLineNumber: marker[marker.length - 1].endLineNumber,
                            endColumn: marker[marker.length - 1].endColumn
                        });
                    }
                    else {
                        marker = diagnostics.map(diag => ({ ...converter.Diagnostic.from(diag), modelVersionId: this._modelVersionIdProvider(uri) }));
                    }
                }
                entries.push([uri, marker]);
                totalMarkerCount += marker.length;
                if (totalMarkerCount > this._maxDiagnosticsTotal) {
                    // ignore markers that are above the limit
                    break;
                }
            }
            this.#proxy.$changeMany(this._owner, entries);
        }
        delete(uri) {
            this._checkDisposed();
            this.#onDidChangeDiagnostics.fire([uri]);
            this.#data.delete(uri);
            this.#proxy?.$changeMany(this._owner, [[uri, undefined]]);
        }
        clear() {
            this._checkDisposed();
            this.#onDidChangeDiagnostics.fire([...this.#data.keys()]);
            this.#data.clear();
            this.#proxy?.$clear(this._owner);
        }
        forEach(callback, thisArg) {
            this._checkDisposed();
            for (const [uri, values] of this) {
                callback.call(thisArg, uri, values, this);
            }
        }
        *[Symbol.iterator]() {
            this._checkDisposed();
            for (const uri of this.#data.keys()) {
                yield [uri, this.get(uri)];
            }
        }
        get(uri) {
            this._checkDisposed();
            const result = this.#data.get(uri);
            if (Array.isArray(result)) {
                return Object.freeze(result.slice(0));
            }
            return [];
        }
        has(uri) {
            this._checkDisposed();
            return Array.isArray(this.#data.get(uri));
        }
        _checkDisposed() {
            if (this._isDisposed) {
                throw new Error('illegal state - object is disposed');
            }
        }
        static _compareIndexedTuplesByUri(a, b) {
            if (a[0].toString() < b[0].toString()) {
                return -1;
            }
            else if (a[0].toString() > b[0].toString()) {
                return 1;
            }
            else {
                return 0;
            }
        }
    }
    exports.DiagnosticCollection = DiagnosticCollection;
    let ExtHostDiagnostics = class ExtHostDiagnostics {
        static { ExtHostDiagnostics_1 = this; }
        static { this._idPool = 0; }
        static { this._maxDiagnosticsPerFile = 1000; }
        static { this._maxDiagnosticsTotal = 1.1 * ExtHostDiagnostics_1._maxDiagnosticsPerFile; }
        static _mapper(last) {
            const map = new map_1.ResourceMap();
            for (const uri of last) {
                map.set(uri, uri);
            }
            return { uris: Object.freeze(Array.from(map.values())) };
        }
        constructor(mainContext, _logService, _fileSystemInfoService, _extHostDocumentsAndEditors) {
            this._logService = _logService;
            this._fileSystemInfoService = _fileSystemInfoService;
            this._extHostDocumentsAndEditors = _extHostDocumentsAndEditors;
            this._collections = new Map();
            this._onDidChangeDiagnostics = new event_1.DebounceEmitter({ merge: all => all.flat(), delay: 50 });
            this.onDidChangeDiagnostics = event_1.Event.map(this._onDidChangeDiagnostics.event, ExtHostDiagnostics_1._mapper);
            this._proxy = mainContext.getProxy(extHost_protocol_1.MainContext.MainThreadDiagnostics);
        }
        createDiagnosticCollection(extensionId, name) {
            const { _collections, _proxy, _onDidChangeDiagnostics, _logService, _fileSystemInfoService, _extHostDocumentsAndEditors } = this;
            const loggingProxy = new class {
                $changeMany(owner, entries) {
                    _proxy.$changeMany(owner, entries);
                    _logService.trace('[DiagnosticCollection] change many (extension, owner, uris)', extensionId.value, owner, entries.length === 0 ? 'CLEARING' : entries);
                }
                $clear(owner) {
                    _proxy.$clear(owner);
                    _logService.trace('[DiagnosticCollection] remove all (extension, owner)', extensionId.value, owner);
                }
                dispose() {
                    _proxy.dispose();
                }
            };
            let owner;
            if (!name) {
                name = '_generated_diagnostic_collection_name_#' + ExtHostDiagnostics_1._idPool++;
                owner = name;
            }
            else if (!_collections.has(name)) {
                owner = name;
            }
            else {
                this._logService.warn(`DiagnosticCollection with name '${name}' does already exist.`);
                do {
                    owner = name + ExtHostDiagnostics_1._idPool++;
                } while (_collections.has(owner));
            }
            const result = new class extends DiagnosticCollection {
                constructor() {
                    super(name, owner, ExtHostDiagnostics_1._maxDiagnosticsTotal, ExtHostDiagnostics_1._maxDiagnosticsPerFile, uri => _extHostDocumentsAndEditors.getDocument(uri)?.version, _fileSystemInfoService.extUri, loggingProxy, _onDidChangeDiagnostics);
                    _collections.set(owner, this);
                }
                dispose() {
                    super.dispose();
                    _collections.delete(owner);
                }
            };
            return result;
        }
        getDiagnostics(resource) {
            if (resource) {
                return this._getDiagnostics(resource);
            }
            else {
                const index = new Map();
                const res = [];
                for (const collection of this._collections.values()) {
                    collection.forEach((uri, diagnostics) => {
                        let idx = index.get(uri.toString());
                        if (typeof idx === 'undefined') {
                            idx = res.length;
                            index.set(uri.toString(), idx);
                            res.push([uri, []]);
                        }
                        res[idx][1] = res[idx][1].concat(...diagnostics);
                    });
                }
                return res;
            }
        }
        _getDiagnostics(resource) {
            let res = [];
            for (const collection of this._collections.values()) {
                if (collection.has(resource)) {
                    res = res.concat(collection.get(resource));
                }
            }
            return res;
        }
        $acceptMarkersChange(data) {
            if (!this._mirrorCollection) {
                const name = '_generated_mirror';
                const collection = new DiagnosticCollection(name, name, Number.MAX_SAFE_INTEGER, Number.MAX_SAFE_INTEGER, // no limits because this collection is just a mirror of "sanitized" data
                // no limits because this collection is just a mirror of "sanitized" data
                _uri => undefined, this._fileSystemInfoService.extUri, undefined, this._onDidChangeDiagnostics);
                this._collections.set(name, collection);
                this._mirrorCollection = collection;
            }
            for (const [uri, markers] of data) {
                this._mirrorCollection.set(uri_1.URI.revive(uri), markers.map(converter.Diagnostic.to));
            }
        }
    };
    exports.ExtHostDiagnostics = ExtHostDiagnostics;
    exports.ExtHostDiagnostics = ExtHostDiagnostics = ExtHostDiagnostics_1 = __decorate([
        __param(1, log_1.ILogService),
        __param(2, extHostFileSystemInfo_1.IExtHostFileSystemInfo)
    ], ExtHostDiagnostics);
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZXh0SG9zdERpYWdub3N0aWNzLmpzIiwic291cmNlUm9vdCI6ImZpbGU6Ly8vd29ya3NwYWNlL2FwcGZsb3cvc3JjLyIsInNvdXJjZXMiOlsidnMvd29ya2JlbmNoL2FwaS9jb21tb24vZXh0SG9zdERpYWdub3N0aWNzLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Z0dBR2dHOzs7Ozs7Ozs7Ozs7Ozs7SUFtQmhHLE1BQWEsb0JBQW9CO1FBRXZCLE1BQU0sQ0FBeUM7UUFDL0MsdUJBQXVCLENBQWlDO1FBQ3hELEtBQUssQ0FBbUM7UUFJakQsWUFDa0IsS0FBYSxFQUNiLE1BQWMsRUFDZCxvQkFBNEIsRUFDNUIsc0JBQThCLEVBQzlCLHVCQUF5RCxFQUMxRSxNQUFlLEVBQ2YsS0FBNkMsRUFDN0Msc0JBQXNEO1lBUHJDLFVBQUssR0FBTCxLQUFLLENBQVE7WUFDYixXQUFNLEdBQU4sTUFBTSxDQUFRO1lBQ2QseUJBQW9CLEdBQXBCLG9CQUFvQixDQUFRO1lBQzVCLDJCQUFzQixHQUF0QixzQkFBc0IsQ0FBUTtZQUM5Qiw0QkFBdUIsR0FBdkIsdUJBQXVCLENBQWtDO1lBUG5FLGdCQUFXLEdBQUcsS0FBSyxDQUFDO1lBWTNCLElBQUksQ0FBQyxvQkFBb0IsR0FBRyxJQUFJLENBQUMsR0FBRyxDQUFDLHNCQUFzQixFQUFFLG9CQUFvQixDQUFDLENBQUM7WUFDbkYsSUFBSSxDQUFDLEtBQUssR0FBRyxJQUFJLGlCQUFXLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxNQUFNLENBQUMsZ0JBQWdCLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQztZQUNsRSxJQUFJLENBQUMsTUFBTSxHQUFHLEtBQUssQ0FBQztZQUNwQixJQUFJLENBQUMsdUJBQXVCLEdBQUcsc0JBQXNCLENBQUM7UUFDdkQsQ0FBQztRQUVELE9BQU87WUFDTixJQUFJLENBQUMsSUFBSSxDQUFDLFdBQVcsRUFBRTtnQkFDdEIsSUFBSSxDQUFDLHVCQUF1QixDQUFDLElBQUksQ0FBQyxDQUFD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