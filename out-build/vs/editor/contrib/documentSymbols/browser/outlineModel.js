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
define(["require", "exports", "vs/base/common/arrays", "vs/base/common/cancellation", "vs/base/common/errors", "vs/base/common/iterator", "vs/base/common/map", "vs/base/common/strings", "vs/editor/common/core/position", "vs/editor/common/core/range", "vs/editor/common/services/languageFeatureDebounce", "vs/platform/instantiation/common/instantiation", "vs/platform/instantiation/common/extensions", "vs/editor/common/services/model", "vs/base/common/lifecycle", "vs/editor/common/services/languageFeatures"], function (require, exports, arrays_1, cancellation_1, errors_1, iterator_1, map_1, strings_1, position_1, range_1, languageFeatureDebounce_1, instantiation_1, extensions_1, model_1, lifecycle_1, languageFeatures_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$S8 = exports.$R8 = exports.$Q8 = exports.$P8 = exports.$O8 = exports.$N8 = void 0;
    class $N8 {
        remove() {
            this.parent?.children.delete(this.id);
        }
        static findId(candidate, container) {
            // complex id-computation which contains the origin/extension,
            // the parent path, and some dedupe logic when names collide
            let candidateId;
            if (typeof candidate === 'string') {
                candidateId = `${container.id}/${candidate}`;
            }
            else {
                candidateId = `${container.id}/${candidate.name}`;
                if (container.children.get(candidateId) !== undefined) {
                    candidateId = `${container.id}/${candidate.name}_${candidate.range.startLineNumber}_${candidate.range.startColumn}`;
                }
            }
            let id = candidateId;
            for (let i = 0; container.children.get(id) !== undefined; i++) {
                id = `${candidateId}_${i}`;
            }
            return id;
        }
        static getElementById(id, element) {
            if (!id) {
                return undefined;
            }
            const len = (0, strings_1.$Oe)(id, element.id);
            if (len === id.length) {
                return element;
            }
            if (len < element.id.length) {
                return undefined;
            }
            for (const [, child] of element.children) {
                const candidate = $N8.getElementById(id, child);
                if (candidate) {
                    return candidate;
                }
            }
            return undefined;
        }
        static size(element) {
            let res = 1;
            for (const [, child] of element.children) {
                res += $N8.size(child);
            }
            return res;
        }
        static empty(element) {
            return element.children.size === 0;
        }
    }
    exports.$N8 = $N8;
    class $O8 extends $N8 {
        constructor(id, parent, symbol) {
            super();
            this.id = id;
            this.parent = parent;
            this.symbol = symbol;
            this.children = new Map();
        }
    }
    exports.$O8 = $O8;
    class $P8 extends $N8 {
        constructor(id, parent, label, order) {
            super();
            this.id = id;
            this.parent = parent;
            this.label = label;
            this.order = order;
            this.children = new Map();
        }
        getItemEnclosingPosition(position) {
            return position ? this.c(position, this.children) : undefined;
        }
        c(position, children) {
            for (const [, item] of children) {
                if (!item.symbol.range || !range_1.$ks.containsPosition(item.symbol.range, position)) {
                    continue;
                }
                return this.c(position, item.children) || item;
            }
            return undefined;
        }
        updateMarker(marker) {
            for (const [, child] of this.children) {
                this.d(marker, child);
            }
        }
        d(markers, item) {
            item.marker = undefined;
            // find the proper start index to check for item/marker overlap.
            const idx = (0, arrays_1.$ub)(markers, item.symbol.range, range_1.$ks.compareRangesUsingStarts);
            let start;
            if (idx < 0) {
                start = ~idx;
                if (start > 0 && range_1.$ks.areIntersecting(markers[start - 1], item.symbol.range)) {
                    start -= 1;
                }
            }
            else {
                start = idx;
            }
            const myMarkers = [];
            let myTopSev;
            for (; start < markers.length && range_1.$ks.areIntersecting(item.symbol.range, markers[start]); start++) {
                // remove markers intersecting with this outline element
                // and store them in a 'private' array.
                const marker = markers[start];
                myMarkers.push(marker);
                markers[start] = undefined;
                if (!myTopSev || marker.severity > myTopSev) {
                    myTopSev = marker.severity;
                }
            }
            // Recurse into children and let them match markers that have matched
            // this outline element. This might remove markers from this element and
            // therefore we remember that we have had markers. That allows us to render
            // the dot, saying 'this element has children with markers'
            for (const [, child] of item.children) {
                this.d(myMarkers, child);
            }
            if (myTopSev) {
                item.marker = {
                    count: myMarkers.length,
                    topSev: myTopSev
                };
            }
            (0, arrays_1.$Gb)(markers);
        }
    }
    exports.$P8 = $P8;
    class $Q8 extends $N8 {
        static create(registry, textModel, token) {
            const cts = new cancellation_1.$pd(token);
            const result = new $Q8(textModel.uri);
            const provider = registry.ordered(textModel);
            const promises = provider.map((provider, index) => {
                const id = $N8.findId(`provider_${index}`, result);
                const group = new $P8(id, result, provider.displayName ?? 'Unknown Outline Provider', index);
                return Promise.resolve(provider.provideDocumentSymbols(textModel, cts.token)).then(result => {
                    for (const info of result || []) {
                        $Q8.c(info, group);
                    }
                    return group;
                }, err => {
                    (0, errors_1.$Z)(err);
                    return group;
                }).then(group => {
                    if (!$N8.empty(group)) {
                        result.e.set(id, group);
                    }
                    else {
                        group.remove();
                    }
                });
            });
            const listener = registry.onDidChange(() => {
                const newProvider = registry.ordered(textModel);
                if (!(0, arrays_1.$sb)(newProvider, provider)) {
                    cts.cancel();
                }
            });
            return Promise.all(promises).then(() => {
                if (cts.token.isCancellationRequested && !token.isCancellationRequested) {
                    return $Q8.create(registry, textModel, token);
                }
                else {
                    return result.f();
                }
            }).finally(() => {
                cts.dispose();
                listener.dispose();
                cts.dispose();
            });
        }
        static c(info, container) {
            const id = $N8.findId(info, container);
            const res = new $O8(id, container, info);
            if (info.children) {
                for (const childInfo of info.children) {
                    $Q8.c(childInfo, res);
                }
            }
            container.children.set(res.id, res);
        }
        static get(element) {
            while (element) {
                if (element instanceof $Q8) {
                    return element;
                }
                element = element.parent;
            }
            return undefined;
        }
        constructor(uri) {
            super();
            this.uri = uri;
            this.id = 'root';
            this.parent = undefined;
            this.e = new Map();
            this.children = new Map();
            this.id = 'root';
            this.parent = undefined;
        }
        f() {
            let count = 0;
            for (const [key, group] of this.e) {
                if (group.children.size === 0) { // empty
                    this.e.delete(key);
                }
                else {
                    count += 1;
                }
            }
            if (count !== 1) {
                //
                this.children = this.e;
            }
            else {
                // adopt all elements of the first group
                const group = iterator_1.Iterable.first(this.e.values());
                for (const [, child] of group.children) {
                    child.parent = this;
                    this.children.set(child.id, child);
                }
            }
            return this;
        }
        merge(other) {
            if (this.uri.toString() !== other.uri.toString()) {
                return false;
            }
            if (this.e.size !== other.e.size) {
                return false;
            }
            this.e = other.e;
            this.children = other.children;
            return true;
        }
        getItemEnclosingPosition(position, context) {
            let preferredGroup;
            if (context) {
                let candidate = context.parent;
                while (candidate && !preferredGroup) {
                    if (candidate instanceof $P8) {
                        preferredGroup = candidate;
                    }
                    candidate = candidate.parent;
                }
            }
            let result = undefined;
            for (const [, group] of this.e) {
                result = group.getItemEnclosingPosition(position);
                if (result && (!preferredGroup || preferredGroup === group)) {
                    break;
                }
            }
            return result;
        }
        getItemById(id) {
            return $N8.getElementById(id, this);
        }
        updateMarker(marker) {
            // sort markers by start range so that we can use
            // outline element starts for quicker look up
            marker.sort(range_1.$ks.compareRangesUsingStarts);
            for (const [, group] of this.e) {
                group.updateMarker(marker.slice(0));
            }
        }
        getTopLevelSymbols() {
            const roots = [];
            for (const child of this.children.values()) {
                if (child instanceof $O8) {
                    roots.push(child.symbol);
                }
                else {
                    roots.push(...iterator_1.Iterable.map(child.children.values(), child => child.symbol));
                }
            }
            return roots.sort((a, b) => range_1.$ks.compareRangesUsingStarts(a.range, b.range));
        }
        asListOfDocumentSymbols() {
            const roots = this.getTopLevelSymbols();
            const bucket = [];
            $Q8.g(bucket, roots, '');
            return bucket.sort((a, b) => position_1.$js.compare(range_1.$ks.getStartPosition(a.range), range_1.$ks.getStartPosition(b.range)) || position_1.$js.compare(range_1.$ks.getEndPosition(b.range), range_1.$ks.getEndPosition(a.range)));
        }
        static g(bucket, entries, overrideContainerLabel) {
            for (const entry of entries) {
                bucket.push({
                    kind: entry.kind,
                    tags: entry.tags,
                    name: entry.name,
                    detail: entry.detail,
                    containerName: entry.containerName || overrideContainerLabel,
                    range: entry.range,
                    selectionRange: entry.selectionRange,
                    children: undefined, // we flatten it...
                });
                // Recurse over children
                if (entry.children) {
                    $Q8.g(bucket, entry.children, entry.name);
                }
            }
        }
    }
    exports.$Q8 = $Q8;
    exports.$R8 = (0, instantiation_1.$Bh)('IOutlineModelService');
    let $S8 = class $S8 {
        constructor(f, debounces, modelService) {
            this.f = f;
            this.c = new lifecycle_1.$jc();
            this.e = new map_1.$Ci(10, 0.7);
            this.d = debounces.for(f.documentSymbolProvider, 'DocumentSymbols', { min: 350 });
            // don't cache outline models longer than their text model
            this.c.add(modelService.onModelRemoved(textModel => {
                this.e.delete(textModel.id);
            }));
        }
        dispose() {
            this.c.dispose();
        }
        async getOrCreate(textModel, token) {
            const registry = this.f.documentSymbolProvider;
            const provider = registry.ordered(textModel);
            let data = this.e.get(textModel.id);
            if (!data || data.versionId !== textModel.getVersionId() || !(0, arrays_1.$sb)(data.provider, provider)) {
                const source = new cancellation_1.$pd();
                data = {
                    versionId: textModel.getVersionId(),
                    provider,
                    promiseCnt: 0,
                    source,
                    promise: $Q8.create(registry, textModel, source.token),
                    model: undefined,
                };
                this.e.set(textModel.id, data);
                const now = Date.now();
                data.promise.then(outlineModel => {
                    data.model = outlineModel;
                    this.d.update(textModel, Date.now() - now);
                }).catch(_err => {
                    this.e.delete(textModel.id);
                });
            }
            if (data.model) {
                // resolved -> return data
                return data.model;
            }
            // increase usage counter
            data.promiseCnt += 1;
            const listener = token.onCancellationRequested(() => {
                // last -> cancel provider request, remove cached promise
                if (--data.promiseCnt === 0) {
                    data.source.cancel();
                    this.e.delete(textModel.id);
                }
            });
            try {
                return await data.promise;
            }
            finally {
                listener.dispose();
            }
        }
        getDebounceValue(textModel) {
            return this.d.get(textModel);
        }
    };
    exports.$S8 = $S8;
    exports.$S8 = $S8 = __decorate([
        __param(0, languageFeatures_1.$hF),
        __param(1, languageFeatureDebounce_1.$52),
        __param(2, model_1.$yA)
    ], $S8);
    (0, extensions_1.$mr)(exports.$R8, $S8, 1 /* InstantiationType.Delayed */);
});
//# sourceMappingURL=outlineModel.js.map