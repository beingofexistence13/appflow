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
    exports.UriIdentityService = void 0;
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
    let UriIdentityService = class UriIdentityService {
        constructor(_fileService) {
            this._fileService = _fileService;
            this._dispooables = new lifecycle_1.DisposableStore();
            this._limit = 2 ** 16;
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
                    ignorePathCasing = _fileService.hasProvider(uri) && !this._fileService.hasCapability(uri, 1024 /* FileSystemProviderCapabilities.PathCaseSensitive */);
                    schemeIgnoresPathCasingCache.set(uri.scheme, ignorePathCasing);
                }
                return ignorePathCasing;
            };
            this._dispooables.add(event_1.Event.any(_fileService.onDidChangeFileSystemProviderRegistrations, _fileService.onDidChangeFileSystemProviderCapabilities)(e => {
                // remove from cache
                schemeIgnoresPathCasingCache.delete(e.scheme);
            }));
            this.extUri = new resources_1.ExtUri(ignorePathCasing);
            this._canonicalUris = new skipList_1.SkipList((a, b) => this.extUri.compare(a, b, true), this._limit);
        }
        dispose() {
            this._dispooables.dispose();
            this._canonicalUris.clear();
        }
        asCanonicalUri(uri) {
            // (1) normalize URI
            if (this._fileService.hasProvider(uri)) {
                uri = (0, resources_1.normalizePath)(uri);
            }
            // (2) find the uri in its canonical form or use this uri to define it
            const item = this._canonicalUris.get(uri);
            if (item) {
                return item.touch().uri.with({ fragment: uri.fragment });
            }
            // this uri is first and defines the canonical form
            this._canonicalUris.set(uri, new Entry(uri));
            this._checkTrim();
            return uri;
        }
        _checkTrim() {
            if (this._canonicalUris.size < this._limit) {
                return;
            }
            // get all entries, sort by time (MRU) and re-initalize
            // the uri cache and the entry clock. this is an expensive
            // operation and should happen rarely
            const entries = [...this._canonicalUris.entries()].sort((a, b) => {
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
            this._canonicalUris.clear();
            const newSize = this._limit * 0.5;
            for (let i = 0; i < newSize; i++) {
                this._canonicalUris.set(entries[i][0], entries[i][1].touch());
            }
        }
    };
    exports.UriIdentityService = UriIdentityService;
    exports.UriIdentityService = UriIdentityService = __decorate([
        __param(0, files_1.IFileService)
    ], UriIdentityService);
    (0, extensions_1.registerSingleton)(uriIdentity_1.IUriIdentityService, UriIdentityService, 1 /* InstantiationType.Delayed */);
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidXJpSWRlbnRpdHlTZXJ2aWNlLmpzIiwic291cmNlUm9vdCI6ImZpbGU6Ly8vd29ya3NwYWNlL2FwcGZsb3cvc3JjLyIsInNvdXJjZXMiOlsidnMvcGxhdGZvcm0vdXJpSWRlbnRpdHkvY29tbW9uL3VyaUlkZW50aXR5U2VydmljZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O2dHQUdnRzs7Ozs7Ozs7Ozs7Ozs7SUFXaEcsTUFBTSxLQUFLO2lCQUNILFdBQU0sR0FBRyxDQUFDLEFBQUosQ0FBSztRQUVsQixZQUFxQixHQUFRO1lBQVIsUUFBRyxHQUFILEdBQUcsQ0FBSztZQUQ3QixTQUFJLEdBQVcsS0FBSyxDQUFDLE1BQU0sRUFBRSxDQUFDO1FBQ0csQ0FBQztRQUNsQyxLQUFLO1lBQ0osSUFBSSxDQUFDLElBQUksR0FBRyxLQUFLLENBQUMsTUFBTSxFQUFFLENBQUM7WUFDM0IsT0FBTyxJQUFJLENBQUM7UUFDYixDQUFDOztJQUdLLElBQU0sa0JBQWtCLEdBQXhCLE1BQU0sa0JBQWtCO1FBVTlCLFlBQTBCLFlBQTJDO1lBQTFCLGlCQUFZLEdBQVosWUFBWSxDQUFjO1lBSnBELGlCQUFZLEdBQUcsSUFBSSwyQkFBZSxFQUFFLENBQUM7WUFFckMsV0FBTSxHQUFHLENBQUMsSUFBSSxFQUFFLENBQUM7WUFJakMsTUFBTSw0QkFBNEIsR0FBRyxJQUFJLEdBQUcsRUFBbUIsQ0FBQztZQUVoRSxtRkFBbUY7WUFDbkYsbURBQW1EO1lBQ25ELHNCQUFzQjtZQUN0QixtQkFBbUI7WUFDbkIsa0NBQWtDO1lBQ2xDLE1BQU0sZ0JBQWdCLEdBQUcsQ0FBQyxHQUFRLEVBQVcsRUFBRTtnQkFDOUMsSUFBSSxnQkFBZ0IsR0FBRyw0QkFBNEIsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLE1BQU0sQ0FBQyxDQUFDO2dCQUNwRSxJQUFJLGdCQUFnQixLQUFLLFNBQVMsRUFBRTtvQkFDbkMsZ0VBQWdFO29CQUNoRSxnQkFBZ0IsR0FBRyxZQUFZLENBQUMsV0FBVyxD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