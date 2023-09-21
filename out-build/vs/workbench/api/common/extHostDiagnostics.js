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
define(["require", "exports", "vs/nls!vs/workbench/api/common/extHostDiagnostics", "vs/platform/markers/common/markers", "vs/base/common/uri", "./extHost.protocol", "./extHostTypes", "./extHostTypeConverters", "vs/base/common/event", "vs/platform/log/common/log", "vs/base/common/map", "vs/workbench/api/common/extHostFileSystemInfo"], function (require, exports, nls_1, markers_1, uri_1, extHost_protocol_1, extHostTypes_1, converter, event_1, log_1, map_1, extHostFileSystemInfo_1) {
    "use strict";
    var $$ac_1;
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$$ac = exports.$0ac = void 0;
    class $0ac {
        #proxy;
        #onDidChangeDiagnostics;
        #data;
        constructor(d, e, f, g, h, extUri, proxy, onDidChangeDiagnostics) {
            this.d = d;
            this.e = e;
            this.f = f;
            this.g = g;
            this.h = h;
            this.c = false;
            this.f = Math.max(g, f);
            this.#data = new map_1.$zi(uri => extUri.getComparisonKey(uri));
            this.#proxy = proxy;
            this.#onDidChangeDiagnostics = onDidChangeDiagnostics;
        }
        dispose() {
            if (!this.c) {
                this.#onDidChangeDiagnostics.fire([...this.#data.keys()]);
                this.#proxy?.$clear(this.e);
                this.#data.clear();
                this.c = true;
            }
        }
        get name() {
            this.j();
            return this.d;
        }
        set(first, diagnostics) {
            if (!first) {
                // this set-call is a clear-call
                this.clear();
                return;
            }
            // the actual implementation for #set
            this.j();
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
                first = [...first].sort($0ac.k);
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
                    if (diagnostics.length > this.g) {
                        marker = [];
                        const order = [extHostTypes_1.DiagnosticSeverity.Error, extHostTypes_1.DiagnosticSeverity.Warning, extHostTypes_1.DiagnosticSeverity.Information, extHostTypes_1.DiagnosticSeverity.Hint];
                        orderLoop: for (let i = 0; i < 4; i++) {
                            for (const diagnostic of diagnostics) {
                                if (diagnostic.severity === order[i]) {
                                    const len = marker.push({ ...converter.Diagnostic.from(diagnostic), modelVersionId: this.h(uri) });
                                    if (len === this.g) {
                                        break orderLoop;
                                    }
                                }
                            }
                        }
                        // add 'signal' marker for showing omitted errors/warnings
                        marker.push({
                            severity: markers_1.MarkerSeverity.Info,
                            message: (0, nls_1.localize)(0, null, diagnostics.length - this.g),
                            startLineNumber: marker[marker.length - 1].startLineNumber,
                            startColumn: marker[marker.length - 1].startColumn,
                            endLineNumber: marker[marker.length - 1].endLineNumber,
                            endColumn: marker[marker.length - 1].endColumn
                        });
                    }
                    else {
                        marker = diagnostics.map(diag => ({ ...converter.Diagnostic.from(diag), modelVersionId: this.h(uri) }));
                    }
                }
                entries.push([uri, marker]);
                totalMarkerCount += marker.length;
                if (totalMarkerCount > this.f) {
                    // ignore markers that are above the limit
                    break;
                }
            }
            this.#proxy.$changeMany(this.e, entries);
        }
        delete(uri) {
            this.j();
            this.#onDidChangeDiagnostics.fire([uri]);
            this.#data.delete(uri);
            this.#proxy?.$changeMany(this.e, [[uri, undefined]]);
        }
        clear() {
            this.j();
            this.#onDidChangeDiagnostics.fire([...this.#data.keys()]);
            this.#data.clear();
            this.#proxy?.$clear(this.e);
        }
        forEach(callback, thisArg) {
            this.j();
            for (const [uri, values] of this) {
                callback.call(thisArg, uri, values, this);
            }
        }
        *[Symbol.iterator]() {
            this.j();
            for (const uri of this.#data.keys()) {
                yield [uri, this.get(uri)];
            }
        }
        get(uri) {
            this.j();
            const result = this.#data.get(uri);
            if (Array.isArray(result)) {
                return Object.freeze(result.slice(0));
            }
            return [];
        }
        has(uri) {
            this.j();
            return Array.isArray(this.#data.get(uri));
        }
        j() {
            if (this.c) {
                throw new Error('illegal state - object is disposed');
            }
        }
        static k(a, b) {
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
    exports.$0ac = $0ac;
    let $$ac = class $$ac {
        static { $$ac_1 = this; }
        static { this.c = 0; }
        static { this.d = 1000; }
        static { this.e = 1.1 * $$ac_1.d; }
        static _mapper(last) {
            const map = new map_1.$zi();
            for (const uri of last) {
                map.set(uri, uri);
            }
            return { uris: Object.freeze(Array.from(map.values())) };
        }
        constructor(mainContext, j, k, l) {
            this.j = j;
            this.k = k;
            this.l = l;
            this.g = new Map();
            this.h = new event_1.$jd({ merge: all => all.flat(), delay: 50 });
            this.onDidChangeDiagnostics = event_1.Event.map(this.h.event, $$ac_1._mapper);
            this.f = mainContext.getProxy(extHost_protocol_1.$1J.MainThreadDiagnostics);
        }
        createDiagnosticCollection(extensionId, name) {
            const { g: _collections, f: _proxy, h: _onDidChangeDiagnostics, j: _logService, k: _fileSystemInfoService, l: _extHostDocumentsAndEditors } = this;
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
                name = '_generated_diagnostic_collection_name_#' + $$ac_1.c++;
                owner = name;
            }
            else if (!_collections.has(name)) {
                owner = name;
            }
            else {
                this.j.warn(`DiagnosticCollection with name '${name}' does already exist.`);
                do {
                    owner = name + $$ac_1.c++;
                } while (_collections.has(owner));
            }
            const result = new class extends $0ac {
                constructor() {
                    super(name, owner, $$ac_1.e, $$ac_1.d, uri => _extHostDocumentsAndEditors.getDocument(uri)?.version, _fileSystemInfoService.extUri, loggingProxy, _onDidChangeDiagnostics);
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
                return this.m(resource);
            }
            else {
                const index = new Map();
                const res = [];
                for (const collection of this.g.values()) {
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
        m(resource) {
            let res = [];
            for (const collection of this.g.values()) {
                if (collection.has(resource)) {
                    res = res.concat(collection.get(resource));
                }
            }
            return res;
        }
        $acceptMarkersChange(data) {
            if (!this.n) {
                const name = '_generated_mirror';
                const collection = new $0ac(name, name, Number.MAX_SAFE_INTEGER, Number.MAX_SAFE_INTEGER, // no limits because this collection is just a mirror of "sanitized" data
                // no limits because this collection is just a mirror of "sanitized" data
                _uri => undefined, this.k.extUri, undefined, this.h);
                this.g.set(name, collection);
                this.n = collection;
            }
            for (const [uri, markers] of data) {
                this.n.set(uri_1.URI.revive(uri), markers.map(converter.Diagnostic.to));
            }
        }
    };
    exports.$$ac = $$ac;
    exports.$$ac = $$ac = $$ac_1 = __decorate([
        __param(1, log_1.$5i),
        __param(2, extHostFileSystemInfo_1.$9ac)
    ], $$ac);
});
//# sourceMappingURL=extHostDiagnostics.js.map