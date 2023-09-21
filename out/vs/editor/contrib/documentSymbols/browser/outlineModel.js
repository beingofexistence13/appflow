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
    exports.OutlineModelService = exports.IOutlineModelService = exports.OutlineModel = exports.OutlineGroup = exports.OutlineElement = exports.TreeElement = void 0;
    class TreeElement {
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
            const len = (0, strings_1.commonPrefixLength)(id, element.id);
            if (len === id.length) {
                return element;
            }
            if (len < element.id.length) {
                return undefined;
            }
            for (const [, child] of element.children) {
                const candidate = TreeElement.getElementById(id, child);
                if (candidate) {
                    return candidate;
                }
            }
            return undefined;
        }
        static size(element) {
            let res = 1;
            for (const [, child] of element.children) {
                res += TreeElement.size(child);
            }
            return res;
        }
        static empty(element) {
            return element.children.size === 0;
        }
    }
    exports.TreeElement = TreeElement;
    class OutlineElement extends TreeElement {
        constructor(id, parent, symbol) {
            super();
            this.id = id;
            this.parent = parent;
            this.symbol = symbol;
            this.children = new Map();
        }
    }
    exports.OutlineElement = OutlineElement;
    class OutlineGroup extends TreeElement {
        constructor(id, parent, label, order) {
            super();
            this.id = id;
            this.parent = parent;
            this.label = label;
            this.order = order;
            this.children = new Map();
        }
        getItemEnclosingPosition(position) {
            return position ? this._getItemEnclosingPosition(position, this.children) : undefined;
        }
        _getItemEnclosingPosition(position, children) {
            for (const [, item] of children) {
                if (!item.symbol.range || !range_1.Range.containsPosition(item.symbol.range, position)) {
                    continue;
                }
                return this._getItemEnclosingPosition(position, item.children) || item;
            }
            return undefined;
        }
        updateMarker(marker) {
            for (const [, child] of this.children) {
                this._updateMarker(marker, child);
            }
        }
        _updateMarker(markers, item) {
            item.marker = undefined;
            // find the proper start index to check for item/marker overlap.
            const idx = (0, arrays_1.binarySearch)(markers, item.symbol.range, range_1.Range.compareRangesUsingStarts);
            let start;
            if (idx < 0) {
                start = ~idx;
                if (start > 0 && range_1.Range.areIntersecting(markers[start - 1], item.symbol.range)) {
                    start -= 1;
                }
            }
            else {
                start = idx;
            }
            const myMarkers = [];
            let myTopSev;
            for (; start < markers.length && range_1.Range.areIntersecting(item.symbol.range, markers[start]); start++) {
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
                this._updateMarker(myMarkers, child);
            }
            if (myTopSev) {
                item.marker = {
                    count: myMarkers.length,
                    topSev: myTopSev
                };
            }
            (0, arrays_1.coalesceInPlace)(markers);
        }
    }
    exports.OutlineGroup = OutlineGroup;
    class OutlineModel extends TreeElement {
        static create(registry, textModel, token) {
            const cts = new cancellation_1.CancellationTokenSource(token);
            const result = new OutlineModel(textModel.uri);
            const provider = registry.ordered(textModel);
            const promises = provider.map((provider, index) => {
                const id = TreeElement.findId(`provider_${index}`, result);
                const group = new OutlineGroup(id, result, provider.displayName ?? 'Unknown Outline Provider', index);
                return Promise.resolve(provider.provideDocumentSymbols(textModel, cts.token)).then(result => {
                    for (const info of result || []) {
                        OutlineModel._makeOutlineElement(info, group);
                    }
                    return group;
                }, err => {
                    (0, errors_1.onUnexpectedExternalError)(err);
                    return group;
                }).then(group => {
                    if (!TreeElement.empty(group)) {
                        result._groups.set(id, group);
                    }
                    else {
                        group.remove();
                    }
                });
            });
            const listener = registry.onDidChange(() => {
                const newProvider = registry.ordered(textModel);
                if (!(0, arrays_1.equals)(newProvider, provider)) {
                    cts.cancel();
                }
            });
            return Promise.all(promises).then(() => {
                if (cts.token.isCancellationRequested && !token.isCancellationRequested) {
                    return OutlineModel.create(registry, textModel, token);
                }
                else {
                    return result._compact();
                }
            }).finally(() => {
                cts.dispose();
                listener.dispose();
                cts.dispose();
            });
        }
        static _makeOutlineElement(info, container) {
            const id = TreeElement.findId(info, container);
            const res = new OutlineElement(id, container, info);
            if (info.children) {
                for (const childInfo of info.children) {
                    OutlineModel._makeOutlineElement(childInfo, res);
                }
            }
            container.children.set(res.id, res);
        }
        static get(element) {
            while (element) {
                if (element instanceof OutlineModel) {
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
            this._groups = new Map();
            this.children = new Map();
            this.id = 'root';
            this.parent = undefined;
        }
        _compact() {
            let count = 0;
            for (const [key, group] of this._groups) {
                if (group.children.size === 0) { // empty
                    this._groups.delete(key);
                }
                else {
                    count += 1;
                }
            }
            if (count !== 1) {
                //
                this.children = this._groups;
            }
            else {
                // adopt all elements of the first group
                const group = iterator_1.Iterable.first(this._groups.values());
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
            if (this._groups.size !== other._groups.size) {
                return false;
            }
            this._groups = other._groups;
            this.children = other.children;
            return true;
        }
        getItemEnclosingPosition(position, context) {
            let preferredGroup;
            if (context) {
                let candidate = context.parent;
                while (candidate && !preferredGroup) {
                    if (candidate instanceof OutlineGroup) {
                        preferredGroup = candidate;
                    }
                    candidate = candidate.parent;
                }
            }
            let result = undefined;
            for (const [, group] of this._groups) {
                result = group.getItemEnclosingPosition(position);
                if (result && (!preferredGroup || preferredGroup === group)) {
                    break;
                }
            }
            return result;
        }
        getItemById(id) {
            return TreeElement.getElementById(id, this);
        }
        updateMarker(marker) {
            // sort markers by start range so that we can use
            // outline element starts for quicker look up
            marker.sort(range_1.Range.compareRangesUsingStarts);
            for (const [, group] of this._groups) {
                group.updateMarker(marker.slice(0));
            }
        }
        getTopLevelSymbols() {
            const roots = [];
            for (const child of this.children.values()) {
                if (child instanceof OutlineElement) {
                    roots.push(child.symbol);
                }
                else {
                    roots.push(...iterator_1.Iterable.map(child.children.values(), child => child.symbol));
                }
            }
            return roots.sort((a, b) => range_1.Range.compareRangesUsingStarts(a.range, b.range));
        }
        asListOfDocumentSymbols() {
            const roots = this.getTopLevelSymbols();
            const bucket = [];
            OutlineModel._flattenDocumentSymbols(bucket, roots, '');
            return bucket.sort((a, b) => position_1.Position.compare(range_1.Range.getStartPosition(a.range), range_1.Range.getStartPosition(b.range)) || position_1.Position.compare(range_1.Range.getEndPosition(b.range), range_1.Range.getEndPosition(a.range)));
        }
        static _flattenDocumentSymbols(bucket, entries, overrideContainerLabel) {
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
                    OutlineModel._flattenDocumentSymbols(bucket, entry.children, entry.name);
                }
            }
        }
    }
    exports.OutlineModel = OutlineModel;
    exports.IOutlineModelService = (0, instantiation_1.createDecorator)('IOutlineModelService');
    let OutlineModelService = class OutlineModelService {
        constructor(_languageFeaturesService, debounces, modelService) {
            this._languageFeaturesService = _languageFeaturesService;
            this._disposables = new lifecycle_1.DisposableStore();
            this._cache = new map_1.LRUCache(10, 0.7);
            this._debounceInformation = debounces.for(_languageFeaturesService.documentSymbolProvider, 'DocumentSymbols', { min: 350 });
            // don't cache outline models longer than their text model
            this._disposables.add(modelService.onModelRemoved(textModel => {
                this._cache.delete(textModel.id);
            }));
        }
        dispose() {
            this._disposables.dispose();
        }
        async getOrCreate(textModel, token) {
            const registry = this._languageFeaturesService.documentSymbolProvider;
            const provider = registry.ordered(textModel);
            let data = this._cache.get(textModel.id);
            if (!data || data.versionId !== textModel.getVersionId() || !(0, arrays_1.equals)(data.provider, provider)) {
                const source = new cancellation_1.CancellationTokenSource();
                data = {
                    versionId: textModel.getVersionId(),
                    provider,
                    promiseCnt: 0,
                    source,
                    promise: OutlineModel.create(registry, textModel, source.token),
                    model: undefined,
                };
                this._cache.set(textModel.id, data);
                const now = Date.now();
                data.promise.then(outlineModel => {
                    data.model = outlineModel;
                    this._debounceInformation.update(textModel, Date.now() - now);
                }).catch(_err => {
                    this._cache.delete(textModel.id);
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
                    this._cache.delete(textModel.id);
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
            return this._debounceInformation.get(textModel);
        }
    };
    exports.OutlineModelService = OutlineModelService;
    exports.OutlineModelService = OutlineModelService = __decorate([
        __param(0, languageFeatures_1.ILanguageFeaturesService),
        __param(1, languageFeatureDebounce_1.ILanguageFeatureDebounceService),
        __param(2, model_1.IModelService)
    ], OutlineModelService);
    (0, extensions_1.registerSingleton)(exports.IOutlineModelService, OutlineModelService, 1 /* InstantiationType.Delayed */);
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoib3V0bGluZU1vZGVsLmpzIiwic291cmNlUm9vdCI6ImZpbGU6Ly8vd29ya3NwYWNlL2FwcGZsb3cvc3JjLyIsInNvdXJjZXMiOlsidnMvZWRpdG9yL2NvbnRyaWIvZG9jdW1lbnRTeW1ib2xzL2Jyb3dzZXIvb3V0bGluZU1vZGVsLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Z0dBR2dHOzs7Ozs7Ozs7Ozs7OztJQXNCaEcsTUFBc0IsV0FBVztRQU1oQyxNQUFNO1lBQ0wsSUFBSSxDQUFDLE1BQU0sRUFBRSxRQUFRLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsQ0FBQztRQUN2QyxDQUFDO1FBRUQsTUFBTSxDQUFDLE1BQU0sQ0FBQyxTQUFrQyxFQUFFLFNBQXNCO1lBQ3ZFLDhEQUE4RDtZQUM5RCw0REFBNEQ7WUFDNUQsSUFBSSxXQUFtQixDQUFDO1lBQ3hCLElBQUksT0FBTyxTQUFTLEtBQUssUUFBUSxFQUFFO2dCQUNsQyxXQUFXLEdBQUcsR0FBRyxTQUFTLENBQUMsRUFBRSxJQUFJLFNBQVMsRUFBRSxDQUFDO2FBQzdDO2lCQUFNO2dCQUNOLFdBQVcsR0FBRyxHQUFHLFNBQVMsQ0FBQyxFQUFFLElBQUksU0FBUyxDQUFDLElBQUksRUFBRSxDQUFDO2dCQUNsRCxJQUFJLFNBQVMsQ0FBQyxRQUFRLENBQUMsR0FBRyxDQUFDLFdBQVcsQ0FBQyxLQUFLLFNBQVMsRUFBRTtvQkFDdEQsV0FBVyxHQUFHLEdBQUcsU0FBUyxDQUFDLEVBQUUsSUFBSSxTQUFTLENBQUMsSUFBSSxJQUFJLFNBQVMsQ0FBQyxLQUFLLENBQUMsZUFBZSxJQUFJLFNBQVMsQ0FBQyxLQUFLLENBQUMsV0FBVyxFQUFFLENBQUM7aUJBQ3BIO2FBQ0Q7WUFFRCxJQUFJLEVBQUUsR0FBRyxXQUFXLENBQUM7WUFDckIsS0FBSyxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsU0FBUyxDQUFDLFFBQVEsQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLEtBQUssU0FBUyxFQUFFLENBQUMsRUFBRSxFQUFFO2dCQUM5RCxFQUFFLEdBQUcsR0FBRyxXQUFXLElBQUksQ0FBQyxFQUFFLENBQUM7YUFDM0I7WUFFRCxPQUFPLEVBQUUsQ0FBQztRQUNYLENBQUM7UUFFRCxNQUFNLENBQUMsY0FBYyxDQUFDLEVBQVUsRUFBRSxPQUFvQjtZQUNyRCxJQUFJLENBQUMsRUFBRSxFQUFFO2dCQUNSLE9BQU8sU0FBUyxDQUFDO2FBQ2pCO1lBQ0QsTUFBTSxHQUFHLEdBQUcsSUFBQSw0QkFBa0IsRUFBQyxFQUFFLEVBQUUsT0FBTyxDQUFDLEVBQUUsQ0FBQyxDQUFDO1lBQy9DLElBQUksR0FBRyxLQUFLLEVBQUUsQ0FBQyxNQUFNLEVBQUU7Z0JBQ3RCLE9BQU8sT0FBTyxDQUFDO2FBQ2Y7WUFDRCxJQUFJLEdBQUcsR0FBRyxPQUFPLENBQUMsRUFBRSxDQUFDLE1BQU0sRUFBRTtnQkFDNUIsT0FBTyxTQUFTLENBQUM7YUFDakI7WUFDRCxLQUFLLE1BQU0sQ0FBQyxFQUFFLEtBQUssQ0FBQyxJQUFJLE9BQU8sQ0FBQyxRQUFRLEVBQUU7Z0JBQ3pDLE1BQU0sU0FBUyxHQUFHLFdBQVcsQ0FBQyxjQUFjLENBQUMsRUFBRSxFQUFFLEtBQUssQ0FBQyxDQUFDO2dCQUN4RCxJQUFJLFNBQVMsRUFBRTtvQkFDZCxPQUFPLFNBQVMsQ0FBQztpQkFDakI7YUFDRDtZQUNELE9BQU8sU0FBUyxDQUFDO1FBQ2xCLENBQUM7UUFFRCxNQUFNLENBQUMsSUFBSSxDQUFDLE9BQW9CO1lBQy9CLElBQUksR0FBRyxHQUFHLENBQUMsQ0FBQztZQUNaLEtBQUssTUFBTSxDQUFDLEVBQUUsS0FBSyxDQUFDLElBQUksT0FBTyxDQUFDLFFBQVEsRUFBRTtnQkFDekMsR0FBRyxJQUFJLFdBQVcsQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUM7YUFDL0I7WUFDRCxPQUFPLEdBQUcsQ0FBQztRQUNaLENBQUM7UUFFRCxNQUFNLENBQUMsS0FBSyxDQUFDLE9BQW9CO1lBQ2hDLE9BQU8sT0FBTyxDQUFDLFFBQVEsQ0FBQyxJQUFJLEtBQUssQ0FBQyxDQUFDO1FBQ3BDLENBQUM7S0FDRDtJQTlERCxrQ0E4REM7SUFVRCxNQUFhLGNBQWUsU0FBUSxXQUFXO1FBSzlDLFlBQ1UsRUFBVSxFQUNaLE1BQStCLEVBQzdCLE1BQXNCO1lBRS9CLEtBQUssRUFBRSxDQUFDO1lBSkMsT0FBRSxHQUFGLEVBQUUsQ0FBUTtZQUNaLFdBQU0sR0FBTixNQUFNLENBQXlCO1lBQzdCLFdBQU0sR0FBTixNQUFNLENBQWdCO1lBTmhDLGFBQVEsR0FBRyxJQUFJLEdBQUcsRUFBMEIsQ0FBQztRQVM3QyxDQUFDO0tBQ0Q7SUFaRCx3Q0FZQztJQUVELE1BQWEsWUFBYSxTQUFRLFdBQVc7UUFJNUMsWUFDVSxFQUFVLEVBQ1osTUFBK0IsRUFDN0IsS0FBYSxFQUNiLEtBQWE7WUFFdEIsS0FBSyxFQUFFLENBQUM7WUFMQyxPQUFFLEdBQUYsRUFBRSxDQUFRO1lBQ1osV0FBTSxHQUFOLE1BQU0sQ0FBeUI7WUFDN0IsVUFBSyxHQUFMLEtBQUssQ0FBUTtZQUNiLFVBQUssR0FBTCxLQUFLLENBQVE7WUFOdkIsYUFBUSxHQUFHLElBQUksR0FBRyxFQUEwQixDQUFDO1FBUzdDLENBQUM7UUFFRCx3QkFBd0IsQ0FBQyxRQUFtQjtZQUMzQyxPQUFPLFFBQVEsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLHlCQUF5QixDQUFDLFFBQVEsRUFBRSxJQUFJLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQyxDQUFDLFNBQVMsQ0FBQztRQUN2RixDQUFDO1FBRU8seUJBQXlCLENBQUMsUUFBbUIsRUFBRSxRQUFxQztZQUMzRixLQUFLLE1BQU0sQ0FBQyxFQUFFLElBQUksQ0FBQyxJQUFJLFFBQVEsRUFBRTtnQkFDaEMsSUFBSSxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsS0FBSyxJQUFJLENBQUMsYUFBSyxDQUFDLGdCQUFnQixDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsS0FBSyxFQUFFLFFBQVEsQ0FBQyxFQUFFO29CQUMvRSxTQUFTO2lCQUNUO2dCQUNELE9BQU8sSUFBSSxDQUFDLHlCQUF5QixDQUFDLFFBQVEsRUFBRSxJQUFJLENBQUMsUUFBUSxDQUFDLElBQUksSUFBSSxDQUFDO2FBQ3ZFO1lBQ0QsT0FBTyxTQUFTLENBQUM7UUFDbEIsQ0FBQztRQUVELFlBQVksQ0FBQyxNQUF3QjtZQUNwQyxLQUFLLE1BQU0sQ0FBQyxFQUFFLEtBQUssQ0FBQyxJQUFJLElBQUksQ0FBQyxRQUFRLEVBQUU7Z0JBQ3RDLElBQUksQ0FBQyxhQUFhLENBQUMsTUFBTSxFQUFFLEtBQUssQ0FBQyxDQUFDO2FBQ2xDO1FBQ0YsQ0FBQztRQUVPLGFBQWEsQ0FBQyxPQUF5QixFQUFFLElBQW9CO1lBQ3BFLElBQUksQ0FBQyxNQUFNLEdBQUcsU0FBUyxDQUFDO1lBRXhCLGdFQUFnRTtZQUNoRSxNQUFNLEdBQUcsR0FBRyxJQUFBLHFCQUFZLEVBQVMsT0FBTyxFQUFFLElBQUksQ0FBQyxNQUFNLENBQUMsS0FBSyxFQUFFLGFBQUssQ0FBQyx3QkFBd0IsQ0FBQyxDQUFDO1lBQzdGLElBQUksS0FBYSxDQUFDO1lBQ2xCLElBQUksR0FBRyxHQUFHLENBQUMsRUFBRTtnQkFDWixLQUFLLEdBQUcsQ0FBQyxHQUFHLENBQUM7Z0JBQ2IsSUFBSSxLQUFLLEdBQUcsQ0FBQyxJQUFJLGFBQUssQ0FBQyxlQUFlLENBQUMsT0FBTyxDQUFDLEtBQUssR0FBRyxDQUFDLENBQUMsRUFBRSxJQUFJLENBQUMsTUFBTSxDQUFDLEtBQUssQ0FBQyxFQUFFO29CQUM5RSxLQUFLLElBQUksQ0FBQyxDQUFDO2lCQUNYO2FBQ0Q7aUJBQU07Z0JBQ04sS0FBSyxHQUFHLEdBQUcsQ0FBQzthQUNaO1lBRUQsTUFBTSxTQUFTLEdBQXFCLEVBQUUsQ0FBQztZQUN2QyxJQUFJLFFBQW9DLENBQUM7WUFFekMsT0FBTyxLQUFLLEdBQUcsT0FBTyxDQUFDLE1BQU0sSUFBSSxhQUFLLENBQUMsZUFBZSxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsS0FBSyxFQUFFLE9BQU8sQ0FBQyxLQUFLLENBQUMsQ0FBQyxFQUFFLEtBQUssRUFBRSxFQUFFO2dCQUNuRyx3REFBd0Q7Z0JBQ3hELHVDQUF1QztnQkFDdkMsTUFBTSxNQUFNLEdBQUcsT0FBTyxDQUFDLEtBQUssQ0FBQyxDQUFDO2dCQUM5QixTQUFTLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDO2dCQUN0QixPQUE2QyxDQUFDLEtBQUssQ0FBQyxHQUFHLFNBQVMsQ0FBQztnQkFDbEUsSUFBSSxDQUFDLFFBQVEsSUFBSSxNQUFNLENBQUMsUUFBUSxHQUFHLFFBQVEsRUFBRTtvQkFDNUMsUUFBUSxHQUFHLE1BQU0sQ0FBQyxRQUFRLENBQUM7aUJBQzNCO2FBQ0Q7WUFFRCxxRUFBcUU7WUFDckUsd0VBQXdFO1lBQ3hFLDJFQUEyRTtZQUMzRSwyREFBMkQ7WUFDM0QsS0FBSyxNQUFNLENBQUMsRUFBRSxLQUFLLENBQUMsSUFBSSxJQUFJLENBQUMsUUFBUSxFQUFFO2dCQUN0QyxJQUFJLENBQUMsYUFBYSxDQUFDLFNBQVMsRUFBRSxLQUFLLENBQUMsQ0FBQzthQUNyQztZQUVELElBQUksUUFBUSxFQUFFO2dCQUNiLElBQUksQ0FBQyxNQUFNLEdBQUc7b0JBQ2IsS0FBSyxFQUFFLFNBQVMsQ0FBQyxNQUFNO29CQUN2QixNQUFNLEVBQUUsUUFBUTtpQkFDaEIsQ0FBQzthQUNGO1lBRUQsSUFBQSx3QkFBZSxFQUFDLE9BQU8sQ0FBQyxDQUFDO1FBQzFCLENBQUM7S0FDRDtJQS9FRCxvQ0ErRUM7SUFFRCxNQUFhLFlBQWEsU0FBUSxXQUFXO1FBRTVDLE1BQU0sQ0FBQyxNQUFNLENBQUMsUUFBeUQsRUFBRSxTQUFxQixFQUFFLEtBQXdCO1lBRXZILE1BQU0sR0FBRyxHQUFHLElBQUksc0NBQXVCLENBQUMsS0FBSyxDQUFDLENBQUM7WUFDL0MsTUFBTSxNQUFNLEdBQUcsSUFBSSxZQUFZLENBQUMsU0FBUyxDQUFDLEdBQUcsQ0FBQyxDQUFDO1lBQy9DLE1BQU0sUUFBUSxHQUFHLFFBQVEsQ0FBQyxPQUFPLENBQUMsU0FBUyxDQUFDLENBQUM7WUFDN0MsTUFBTSxRQUFRLEdBQUcsUUFBUSxDQUFDLEdBQUcsQ0FBQyxDQUFDLFFBQVEsRUFBRSxLQUFLLEVBQUUsRUFBRTtnQkFFakQsTUFBTSxFQUFFLEdBQUcsV0FBVyxDQUFDLE1BQU0sQ0FBQyxZQUFZLEtBQUssRUFBRSxFQUFFLE1BQU0sQ0FBQyxDQUFDO2dCQUMzRCxNQUFNLEtBQUssR0FBRyxJQUFJLFlBQVksQ0FBQyxFQUFFLEVBQUUsTUFBTSxFQUFFLFFBQVEsQ0FBQyxXQUFXLElBQUksMEJBQTBCLEVBQUUsS0FBSyxDQUFDLENBQUM7Z0JBR3RHLE9BQU8sT0FBTyxDQUFDLE9BQU8sQ0FBQyxRQUFRLENBQUMsc0JBQXNCLENBQUMsU0FBUyxFQUFFLEdBQUcsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsRUFBRTtvQkFDM0YsS0FBSyxNQUFNLElBQUksSUFBSSxNQUFNLElBQUksRUFBRSxFQUFFO3dCQUNoQyxZQUFZLENBQUMsbUJBQW1CLENBQUMsSUFBSSxFQUFFLEtBQUssQ0FBQyxDQUFDO3FCQUM5QztvQkFDRCxPQUFPLEtBQUssQ0FBQztnQkFDZCxDQUFDLEVBQUUsR0FBRyxDQUFDLEVBQUU7b0JBQ1IsSUFBQSxrQ0FBeUIsRUFBQyxHQUFHLENBQUMsQ0FBQztvQkFDL0IsT0FBTyxLQUFLLENBQUM7Z0JBQ2QsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxFQUFFO29CQUNmLElBQUksQ0FBQyxXQUFXLENBQUMsS0FBSyxDQUFDLEtBQUssQ0FBQyxFQUFFO3dCQUM5QixNQUFNLENBQUMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxFQUFFLEVBQUUsS0FBSyxDQUFDLENBQUM7cUJBQzlCO3lCQUFNO3dCQUNOLEtBQUssQ0FBQyxNQUFNLEVBQUUsQ0FBQztxQkFDZjtnQkFDRixDQUFDLENBQUMsQ0FBQztZQUNKLENBQUMsQ0FBQyxDQUFDO1lBRUgsTUFBTSxRQUFRLEdBQUcsUUFBUSxDQUFDLFdBQVcsQ0FBQyxHQUFHLEVBQUU7Z0JBQzFDLE1BQU0sV0FBVyxHQUFHLFFBQVEsQ0FBQyxPQUFPLENBQUMsU0FBUyxDQUFDLENBQUM7Z0JBQ2hELElBQUksQ0FBQyxJQUFBLGVBQU0sRUFBQyxXQUFXLEVBQUUsUUFBUSxDQUFDLEVBQUU7b0JBQ25DLEdBQUcsQ0FBQyxNQUFNLEVBQUUsQ0FBQztpQkFDYjtZQUNGLENBQUMsQ0FBQyxDQUFDO1lBRUgsT0FBTyxPQUFPLENBQUMsR0FBRyxDQUFDLFFBQVEsQ0FBQyxDQUFDLElBQUksQ0FBQyxHQUFHLEVBQUU7Z0JBQ3RDLElBQUksR0FBRyxDQUFDLEtBQUssQ0FBQyx1QkFBdUIsSUFBSSxDQUFDLEtBQUssQ0FBQyx1QkFBdUIsRUFBRTtvQkFDeEUsT0FBTyxZQUFZLENBQUMsTUFBTSxDQUFDLFFBQVEsRUFBRSxTQUFTLEVBQUUsS0FBSyxDQUFDLENBQUM7aUJBQ3ZEO3FCQUFNO29CQUNOLE9BQU8sTUFBTSxDQUFDLFFBQVEsRUFBRSxDQUFDO2lCQUN6QjtZQUNGLENBQUMsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxHQUFHLEVBQUU7Z0JBQ2YsR0FBRyxDQUFDLE9BQU8sRUFBRSxDQUFDO2dCQUNkLFFBQVEsQ0FBQyxPQUFPLEVBQUUsQ0FBQztnQkFDbkIsR0FBRyxDQUFDLE9BQU8sRUFBRSxDQUFDO1lBQ2YsQ0FBQyxDQUFDLENBQUM7UUFDSixDQUFDO1FBRU8sTUFBTSxDQUFDLG1CQUFtQixDQUFDLElBQW9CLEVBQUUsU0FBd0M7WUFDaEcsTUFBTSxFQUFFLEdBQUcsV0FBVyxDQUFDLE1BQU0sQ0FBQyxJQUFJLEVBQUUsU0FBUyxDQUFDLENBQUM7WUFDL0MsTUFBTSxHQUFHLEdBQUcsSUFBSSxjQUFjLENBQUMsRUFBRSxFQUFFLFNBQVMsRUFBRSxJQUFJLENBQUMsQ0FBQztZQUNwRCxJQUFJLElBQUksQ0FBQyxRQUFRLEVBQUU7Z0JBQ2xCLEtBQUssTUFBTSxTQUFTLElBQUksSUFBSSxDQUFDLFFBQVEsRUFBRTtvQkFDdEMsWUFBWSxDQUFDLG1CQUFtQixDQUFDLFNBQVMsRUFBRSxHQUFHLENBQUMsQ0FBQztpQkFDakQ7YUFDRDtZQUNELFNBQVMsQ0FBQyxRQUFRLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxFQUFFLEVBQUUsR0FBRyxDQUFDLENBQUM7UUFDckMsQ0FBQztRQUVELE1BQU0sQ0FBQyxHQUFHLENBQUMsT0FBZ0M7WUFDMUMsT0FBTyxPQUFPLEVBQUU7Z0JBQ2YsSUFBSSxPQUFPLFlBQVksWUFBWSxFQUFFO29CQUNwQyxPQUFPLE9BQU8sQ0FBQztpQkFDZjtnQkFDRCxPQUFPLEdBQUcsT0FBTyxDQUFDLE1BQU0sQ0FBQzthQUN6QjtZQUNELE9BQU8sU0FBUyxDQUFDO1FBQ2xCLENBQUM7UUFRRCxZQUErQixHQUFRO1lBQ3RDLEtBQUssRUFBRSxDQUFDO1lBRHNCLFFBQUcsR0FBSCxHQUFHLENBQUs7WUFOOUIsT0FBRSxHQUFHLE1BQU0sQ0FBQztZQUNaLFdBQU0sR0FBRyxTQUFTLENBQUM7WUFFbEIsWUFBTyxHQUFHLElBQUksR0FBRyxFQUF3QixDQUFDO1lBQ3BELGFBQVEsR0FBRyxJQUFJLEdBQUcsRUFBeUMsQ0FBQztZQUszRCxJQUFJLENBQUMsRUFBRSxHQUFHLE1BQU0sQ0FBQztZQUNqQixJQUFJLENBQUMsTUFBTSxHQUFHLFNBQVMsQ0FBQztRQUN6QixDQUFDO1FBRU8sUUFBUTtZQUNmLElBQUksS0FBSyxHQUFHLENBQUMsQ0FBQztZQUNkLEtBQUssTUFBTSxDQUFDLEdBQUcsRUFBRSxLQUFLLENBQUMsSUFBSSxJQUFJLENBQUMsT0FBTyxFQUFFO2dCQUN4QyxJQUFJLEtBQUssQ0FBQyxRQUFRLENBQUMsSUFBSSxLQUFLLENBQUMsRUFBRSxFQUFFLFFBQVE7b0JBQ3hDLElBQUksQ0FBQyxPQUFPLENBQUMsTUFBTSxDQUFDLEdBQUcsQ0FBQyxDQUFDO2lCQUN6QjtxQkFBTTtvQkFDTixLQUFLLElBQUksQ0FBQyxDQUFDO2lCQUNYO2FBQ0Q7WUFDRCxJQUFJLEtBQUssS0FBSyxDQUFDLEVBQUU7Z0JBQ2hCLEVBQUU7Z0JBQ0YsSUFBSSxDQUFDLFFBQVEsR0FBRyxJQUFJLENBQUMsT0FBTyxDQUFDO2FBQzdCO2lCQUFNO2dCQUNOLHdDQUF3QztnQkFDeEMsTUFBTSxLQUFLLEdBQUcsbUJBQVEsQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxNQUFNLEVBQUUsQ0FBRSxDQUFDO2dCQUNyRCxLQUFLLE1BQU0sQ0FBQyxFQUFFLEtBQUssQ0FBQyxJQUFJLEtBQUssQ0FBQyxRQUFRLEVBQUU7b0JBQ3ZDLEtBQUssQ0FBQyxNQUFNLEdBQUcsSUFBSSxDQUFDO29CQUNwQixJQUFJLENBQUMsUUFBUSxDQUFDLEdBQUcsQ0FBQyxLQUFLLENBQUMsRUFBRSxFQUFFLEtBQUssQ0FBQyxDQUFDO2lCQUNuQzthQUNEO1lBQ0QsT0FBTyxJQUFJLENBQUM7UUFDYixDQUFDO1FBRUQsS0FBSyxDQUFDLEtBQW1CO1lBQ3hCLElBQUksSUFBSSxDQUFDLEdBQUcsQ0FBQyxRQUFRLEVBQUUsS0FBSyxLQUFLLENBQUMsR0FBRyxDQUFDLFFBQVEsRUFBRSxFQUFFO2dCQUNqRCxPQUFPLEtBQUssQ0FBQzthQUNiO1lBQ0QsSUFBSSxJQUFJLENBQUMsT0FBTyxDQUFDLElBQUksS0FBSyxLQUFLLENBQUMsT0FBTyxDQUFDLElBQUksRUFBRTtnQkFDN0MsT0FBTyxLQUFLLENBQUM7YUFDYjtZQUNELElBQUksQ0FBQyxPQUFPLEdBQUcsS0FBSyxDQUFDLE9BQU8sQ0FBQztZQUM3QixJQUFJLENBQUMsUUFBUSxHQUFHLEtBQUssQ0FBQyxRQUFRLENBQUM7WUFDL0IsT0FBTyxJQUFJLENBQUM7UUFDYixDQUFDO1FBRUQsd0JBQXdCLENBQUMsUUFBbUIsRUFBRSxPQUF3QjtZQUVyRSxJQUFJLGNBQXdDLENBQUM7WUFDN0MsSUFBSSxPQUFPLEVBQUU7Z0JBQ1osSUFBSSxTQUFTLEdBQUcsT0FBTyxDQUFDLE1BQU0sQ0FBQztnQkFDL0IsT0FBTyxTQUFTLElBQUksQ0FBQyxjQUFjLEVBQUU7b0JBQ3BDLElBQUksU0FBUyxZQUFZLFlBQVksRUFBRTt3QkFDdEMsY0FBYyxHQUFHLFNBQVMsQ0FBQztxQkFDM0I7b0JBQ0QsU0FBUyxHQUFHLFNBQVMsQ0FBQyxNQUFNLENBQUM7aUJBQzdCO2FBQ0Q7WUFFRCxJQUFJLE1BQU0sR0FBK0IsU0FBUyxDQUFDO1lBQ25ELEtBQUssTUFBTSxDQUFDLEVBQUUsS0FBSyxDQUFDLElBQUksSUFBSSxDQUFDLE9BQU8sRUFBRTtnQkFDckMsTUFBTSxHQUFHLEtBQUssQ0FBQyx3QkFBd0IsQ0FBQyxRQUFRLENBQUMsQ0FBQztnQkFDbEQsSUFBSSxNQUFNLElBQUksQ0FBQyxDQUFDLGNBQWMsSUFBSSxjQUFjLEtBQUssS0FBSyxDQUFDLEVBQUU7b0JBQzVELE1BQU07aUJBQ047YUFDRDtZQUNELE9BQU8sTUFBTSxDQUFDO1FBQ2YsQ0FBQztRQUVELFdBQVcsQ0FBQyxFQUFVO1lBQ3JCLE9BQU8sV0FBVyxDQUFDLGNBQWMsQ0FBQyxFQUFFLEVBQUUsSUFBSSxDQUFDLENBQUM7UUFDN0MsQ0FBQztRQUVELFlBQVksQ0FBQyxNQUF3QjtZQUNwQyxpREFBaUQ7WUFDakQsNkNBQTZDO1lBQzdDLE1BQU0sQ0FBQyxJQUFJLENBQUMsYUFBSyxDQUFDLHdCQUF3QixDQUFDLENBQUM7WUFFNUMsS0FBSyxNQUFNLENBQUMsRUFBRSxLQUFLLENBQUMsSUFBSSxJQUFJLENBQUMsT0FBTyxFQUFFO2dCQUNyQyxLQUFLLENBQUMsWUFBWSxDQUFDLE1BQU0sQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQzthQUNwQztRQUNGLENBQUM7UUFFRCxrQkFBa0I7WUFDakIsTUFBTSxLQUFLLEdBQXFCLEVBQUUsQ0FBQztZQUNuQyxLQUFLLE1BQU0sS0FBSyxJQUFJLElBQUksQ0FBQyxRQUFRLENBQUMsTUFBTSxFQUFFLEVBQUU7Z0JBQzNDLElBQUksS0FBSyxZQUFZLGNBQWMsRUFBRTtvQkFDcEMsS0FBSyxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsTUFBTSxDQUFDLENBQUM7aUJBQ3pCO3FCQUFNO29CQUNOLEtBQUssQ0FBQyxJQUFJLENBQUMsR0FBRyxtQkFBUSxDQUFDLEdBQUcsQ0FBQyxLQUFLLENBQUMsUUFBUSxDQUFDLE1BQU0sRUFBRSxFQUFFLEtBQUssQ0FBQyxFQUFFLENBQUMsS0FBSyxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUM7aUJBQzVFO2FBQ0Q7WUFDRCxPQUFPLEtBQUssQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxhQUFLLENBQUMsd0JBQXdCLENBQUMsQ0FBQyxDQUFDLEtBQUssRUFBRSxDQUFDLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQztRQUMvRSxDQUFDO1FBRUQsdUJBQXVCO1lBQ3RCLE1BQU0sS0FBSyxHQUFHLElBQUksQ0FBQyxrQkFBa0IsRUFBRSxDQUFDO1lBQ3hDLE1BQU0sTUFBTSxHQUFxQixFQUFFLENBQUM7WUFDcEMsWUFBWSxDQUFDLHVCQUF1QixDQUFDLE1BQU0sRUFBRSxLQUFLLEVBQUUsRUFBRSxDQUFDLENBQUM7WUFDeEQsT0FBTyxNQUFNLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxFQUFFLENBQzNCLG1CQUFRLENBQUMsT0FBTyxDQUFDLGFBQUssQ0FBQyxnQkFBZ0IsQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDLEVBQUUsYUFBSyxDQUFDLGdCQUFnQixDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUMsQ0FBQyxJQUFJLG1CQUFRLENBQUMsT0FBTyxDQUFDLGFBQUssQ0FBQyxjQUFjLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxFQUFFLGFBQUssQ0FBQyxjQUFjLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQ3BLLENBQUM7UUFDSCxDQUFDO1FBRU8sTUFBTSxDQUFDLHVCQUF1QixDQUFDLE1BQXdCLEVBQUUsT0FBeUIsRUFBRSxzQkFBOEI7WUFDekgsS0FBSyxNQUFNLEtBQUssSUFBSSxPQUFPLEVBQUU7Z0JBQzVCLE1BQU0sQ0FBQyxJQUFJLENBQUM7b0JBQ1gsSUFBSSxFQUFFLEtBQUssQ0FBQyxJQUFJO29CQUNoQixJQUFJLEVBQUUsS0FBSyxDQUFDLElBQUk7b0JBQ2hCLElBQUksRUFBRSxLQUFLLENBQUMsSUFBSTtvQkFDaEIsTUFBTSxFQUFFLEtBQUssQ0FBQyxNQUFNO29CQUNwQixhQUFhLEVBQUUsS0FBSyxDQUFDLGFBQWEsSUFBSSxzQkFBc0I7b0JBQzVELEtBQUssRUFBRSxLQUFLLENBQUMsS0FBSztvQkFDbEIsY0FBYyxFQUFFLEtBQUssQ0FBQyxjQUFjO29CQUNwQyxRQUFRLEVBQUUsU0FBUyxFQUFFLG1CQUFtQjtpQkFDeEMsQ0FBQyxDQUFDO2dCQUVILHdCQUF3QjtnQkFDeEIsSUFBSSxLQUFLLENBQUMsUUFBUSxFQUFFO29CQUNuQixZQUFZLENBQUMsdUJBQXVCLENBQUMsTUFBTSxFQUFFLEtBQUssQ0FBQyxRQUFRLEVBQUUsS0FBSyxDQUFDLElBQUksQ0FBQyxDQUFDO2lCQUN6RTthQUNEO1FBQ0YsQ0FBQztLQUNEO0lBcE1ELG9DQW9NQztJQUdZLFFBQUEsb0JBQW9CLEdBQUcsSUFBQSwrQkFBZSxFQUF1QixzQkFBc0IsQ0FBQyxDQUFDO0lBa0IzRixJQUFNLG1CQUFtQixHQUF6QixNQUFNLG1CQUFtQjtRQVEvQixZQUMyQix3QkFBbUUsRUFDNUQsU0FBMEMsRUFDNUQsWUFBMkI7WUFGQyw2QkFBd0IsR0FBeEIsd0JBQXdCLENBQTBCO1lBTDdFLGlCQUFZLEdBQUcsSUFBSSwyQkFBZSxFQUFFLENBQUM7WUFFckMsV0FBTSxHQUFHLElBQUksY0FBUSxDQUFxQixFQUFFLEVBQUUsR0FBRyxDQUFDLENBQUM7WUFPbkUsSUFBSSxDQUFDLG9CQUFvQixHQUFHLFNBQVMsQ0FBQyxHQUFHLENBQUMsd0JBQXdCLENBQUMsc0JBQXNCLEVBQUUsaUJBQWlCLEVBQUUsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLENBQUMsQ0FBQztZQUU1SCwwREFBMEQ7WUFDMUQsSUFBSSxDQUFDLFlBQVksQ0FBQyxHQUFHLENBQUMsWUFBWSxDQUFDLGNBQWMsQ0FBQyxTQUFTLENBQUMsRUFBRTtnQkFDN0QsSUFBSSxDQUFDLE1BQU0sQ0FBQyxNQUFNLENBQUMsU0FBUyxDQUFDLEVBQUUsQ0FBQyxDQUFDO1lBQ2xDLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFDTCxDQUFDO1FBRUQsT0FBTztZQUNOLElBQUksQ0FBQyxZQUFZLENBQUMsT0FBTyxFQUFFLENBQUM7UUFDN0IsQ0FBQztRQUVELEtBQUssQ0FBQyxXQUFXLENBQUMsU0FBcUIsRUFBRSxLQUF3QjtZQUVoRSxNQUFNLFFBQVEsR0FBRyxJQUFJLENBQUMsd0JBQXdCLENBQUMsc0JBQXNCLENBQUM7WUFDdEUsTUFBTSxRQUFRLEdBQUcsUUFBUSxDQUFDLE9BQU8sQ0FBQyxTQUFTLENBQUMsQ0FBQztZQUU3QyxJQUFJLElBQUksR0FBRyxJQUFJLENBQUMsTUFBTSxDQUFDLEdBQUcsQ0FBQyxTQUFTLENBQUMsRUFBRSxDQUFDLENBQUM7WUFDekMsSUFBSSxDQUFDLElBQUksSUFBSSxJQUFJLENBQUMsU0FBUyxLQUFLLFNBQVMsQ0FBQyxZQUFZLEVBQUUsSUFBSSxDQUFDLElBQUEsZUFBTSxFQUFDLElBQUksQ0FBQyxRQUFRLEVBQUUsUUFBUSxDQUFDLEVBQUU7Z0JBQzdGLE1BQU0sTUFBTSxHQUFHLElBQUksc0NBQXVCLEVBQUUsQ0FBQztnQkFDN0MsSUFBSSxHQUFHO29CQUNOLFNBQVMsRUFBRSxTQUFTLENBQUMsWUFBWSxFQUFFO29CQUNuQyxRQUFRO29CQUNSLFVBQVUsRUFBRSxDQUFDO29CQUNiLE1BQU07b0JBQ04sT0FBTyxFQUFFLFlBQVksQ0FBQyxNQUFNLENBQUMsUUFBUSxFQUFFLFNBQVMsRUFBRSxNQUFNLENBQUMsS0FBSyxDQUFDO29CQUMvRCxLQUFLLEVBQUUsU0FBUztpQkFDaEIsQ0FBQztnQkFDRixJQUFJLENBQUMsTUFBTSxDQUFDLEdBQUcsQ0FBQyxTQUFTLENBQUMsRUFBRSxFQUFFLElBQUksQ0FBQyxDQUFDO2dCQUVwQyxNQUFNLEdBQUcsR0FBRyxJQUFJLENBQUMsR0FBRyxFQUFFLENBQUM7Z0JBQ3ZCLElBQUksQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLFlBQVksQ0FBQyxFQUFFO29CQUNoQyxJQUFLLENBQUMsS0FBSyxHQUFHLFlBQVksQ0FBQztvQkFDM0IsSUFBSSxDQUFDLG9CQUFvQixDQUFDLE1BQU0sQ0FBQyxTQUFTLEVBQUUsSUFBSSxDQUFDLEdBQUcsRUFBRSxHQUFHLEdBQUcsQ0FBQyxDQUFDO2dCQUMvRCxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLEVBQUU7b0JBQ2YsSUFBSSxDQUFDLE1BQU0sQ0FBQyxNQUFNLENBQUMsU0FBUyxDQUFDLEVBQUUsQ0FBQyxDQUFDO2dCQUNsQyxDQUFDLENBQUMsQ0FBQzthQUNIO1lBRUQsSUFBSSxJQUFJLENBQUMsS0FBSyxFQUFFO2dCQUNmLDBCQUEwQjtnQkFDMUIsT0FBTyxJQUFJLENBQUMsS0FBSyxDQUFDO2FBQ2xCO1lBRUQseUJBQXlCO1lBQ3pCLElBQUksQ0FBQyxVQUFVLElBQUksQ0FBQyxDQUFDO1lBRXJCLE1BQU0sUUFBUSxHQUFHLEtBQUssQ0FBQyx1QkFBdUIsQ0FBQyxHQUFHLEVBQUU7Z0JBQ25ELHlEQUF5RDtnQkFDekQsSUFBSSxFQUFFLElBQUssQ0FBQyxVQUFVLEtBQUssQ0FBQyxFQUFFO29CQUM3QixJQUFLLENBQUMsTUFBTSxDQUFDLE1BQU0sRUFBRSxDQUFDO29CQUN0QixJQUFJLENBQUMsTUFBTSxDQUFDLE1BQU0sQ0FBQyxTQUFTLENBQUMsRUFBRSxDQUFDLENBQUM7aUJBQ2pDO1lBQ0YsQ0FBQyxDQUFDLENBQUM7WUFFSCxJQUFJO2dCQUNILE9BQU8sTUFBTSxJQUFJLENBQUMsT0FBTyxDQUFDO2FBQzFCO29CQUFTO2dCQUNULFFBQVEsQ0FBQyxPQUFPLEVBQUUsQ0FBQzthQUNuQjtRQUNGLENBQUM7UUFFRCxnQkFBZ0IsQ0FBQyxTQUFxQjtZQUNyQyxPQUFPLElBQUksQ0FBQyxvQkFBb0IsQ0FBQyxHQUFHLENBQUMsU0FBUyxDQUFDLENBQUM7UUFDakQsQ0FBQztLQUNELENBQUE7SUE5RVksa0RBQW1CO2tDQUFuQixtQkFBbUI7UUFTN0IsV0FBQSwyQ0FBd0IsQ0FBQTtRQUN4QixXQUFBLHlEQUErQixDQUFBO1FBQy9CLFdBQUEscUJBQWEsQ0FBQTtPQVhILG1CQUFtQixDQThFL0I7SUFFRCxJQUFBLDhCQUFpQixFQUFDLDRCQUFvQixFQUFFLG1CQUFtQixvQ0FBNEIsQ0FBQyJ9