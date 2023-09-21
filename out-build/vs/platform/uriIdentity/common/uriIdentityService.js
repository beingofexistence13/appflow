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
define(["require", "exports", "vs/platform/uriIdentity/common/uriIdentity", "vs/platform/instantiation/common/extensions", "vs/platform/files/common/files", "vs/base/common/resources", "vs/base/common/skipList", "vs/base/common/event", "vs/base/common/lifecycle"], function (require, exports, uriIdentity_1, extensions_1, files_1, resources_1, skipList_1, event_1, lifecycle_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$pr = void 0;
    class Entry {
        static { this._clock = 0; }
        constructor(uri) {
            this.uri = uri;
            this.time = Entry._clock++;
        }
        touch() {
            this.time = Entry._clock++;
            return this;
        }
    }
    let $pr = class $pr {
        constructor(g) {
            this.g = g;
            this.c = new lifecycle_1.$jc();
            this.f = 2 ** 16;
            const schemeIgnoresPathCasingCache = new Map();
            // assume path casing matters unless the file system provider spec'ed the opposite.
            // for all other cases path casing matters, e.g for
            // * virtual documents
            // * in-memory uris
            // * all kind of "private" schemes
            const ignorePathCasing = (uri) => {
                let ignorePathCasing = schemeIgnoresPathCasingCache.get(uri.scheme);
                if (ignorePathCasing === undefined) {
                    // retrieve once and then case per scheme until a change happens
                    ignorePathCasing = g.hasProvider(uri) && !this.g.hasCapability(uri, 1024 /* FileSystemProviderCapabilities.PathCaseSensitive */);
                    schemeIgnoresPathCasingCache.set(uri.scheme, ignorePathCasing);
                }
                return ignorePathCasing;
            };
            this.c.add(event_1.Event.any(g.onDidChangeFileSystemProviderRegistrations, g.onDidChangeFileSystemProviderCapabilities)(e => {
                // remove from cache
                schemeIgnoresPathCasingCache.delete(e.scheme);
            }));
            this.extUri = new resources_1.$0f(ignorePathCasing);
            this.d = new skipList_1.$or((a, b) => this.extUri.compare(a, b, true), this.f);
        }
        dispose() {
            this.c.dispose();
            this.d.clear();
        }
        asCanonicalUri(uri) {
            // (1) normalize URI
            if (this.g.hasProvider(uri)) {
                uri = (0, resources_1.$jg)(uri);
            }
            // (2) find the uri in its canonical form or use this uri to define it
            const item = this.d.get(uri);
            if (item) {
                return item.touch().uri.with({ fragment: uri.fragment });
            }
            // this uri is first and defines the canonical form
            this.d.set(uri, new Entry(uri));
            this.h();
            return uri;
        }
        h() {
            if (this.d.size < this.f) {
                return;
            }
            // get all entries, sort by time (MRU) and re-initalize
            // the uri cache and the entry clock. this is an expensive
            // operation and should happen rarely
            const entries = [...this.d.entries()].sort((a, b) => {
                if (a[1].time < b[1].time) {
                    return 1;
                }
                else if (a[1].time > b[1].time) {
                    return -1;
                }
                else {
                    return 0;
                }
            });
            Entry._clock = 0;
            this.d.clear();
            const newSize = this.f * 0.5;
            for (let i = 0; i < newSize; i++) {
                this.d.set(entries[i][0], entries[i][1].touch());
            }
        }
    };
    exports.$pr = $pr;
    exports.$pr = $pr = __decorate([
        __param(0, files_1.$6j)
    ], $pr);
    (0, extensions_1.$mr)(uriIdentity_1.$Ck, $pr, 1 /* InstantiationType.Delayed */);
});
//# sourceMappingURL=uriIdentityService.js.map