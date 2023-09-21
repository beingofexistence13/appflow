/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/arrays", "vs/base/common/cancellation", "vs/base/common/errors", "vs/base/common/iterator", "vs/base/common/strings", "vs/editor/common/core/position", "vs/editor/common/core/range"], function (require, exports, arrays_1, cancellation_1, errors_1, iterator_1, strings_1, position_1, range_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.OutlineModel = exports.OutlineGroup = exports.OutlineElement = exports.TreeElement = void 0;
    // TODO@hediet: These classes are copied from outlineModel.ts because of layering issues.
    // Because these classes just depend on the DocumentSymbolProvider (which is in the core editor),
    // they should be moved to the core editor as well.
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
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoib3V0bGluZU1vZGVsLmpzIiwic291cmNlUm9vdCI6ImZpbGU6Ly8vd29ya3NwYWNlL2FwcGZsb3cvc3JjLyIsInNvdXJjZXMiOlsidnMvZWRpdG9yL2Jyb3dzZXIvd2lkZ2V0L2RpZmZFZGl0b3Ivb3V0bGluZU1vZGVsLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Z0dBR2dHOzs7OztJQWVoRyx5RkFBeUY7SUFDekYsaUdBQWlHO0lBQ2pHLG1EQUFtRDtJQUVuRCxNQUFzQixXQUFXO1FBTWhDLE1BQU07WUFDTCxJQUFJLENBQUMsTUFBTSxFQUFFLFFBQVEsQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxDQUFDO1FBQ3ZDLENBQUM7UUFFRCxNQUFNLENBQUMsTUFBTSxDQUFDLFNBQWtDLEVBQUUsU0FBc0I7WUFDdkUsOERBQThEO1lBQzlELDREQUE0RDtZQUM1RCxJQUFJLFdBQW1CLENBQUM7WUFDeEIsSUFBSSxPQUFPLFNBQVMsS0FBSyxRQUFRLEVBQUU7Z0JBQ2xDLFdBQVcsR0FBRyxHQUFHLFNBQVMsQ0FBQyxFQUFFLElBQUksU0FBUyxFQUFFLENBQUM7YUFDN0M7aUJBQU07Z0JBQ04sV0FBVyxHQUFHLEdBQUcsU0FBUyxDQUFDLEVBQUUsSUFBSSxTQUFTLENBQUMsSUFBSSxFQUFFLENBQUM7Z0JBQ2xELElBQUksU0FBUyxDQUFDLFFBQVEsQ0FBQyxHQUFHLENBQUMsV0FBVyxDQUFDLEtBQUssU0FBUyxFQUFFO29CQUN0RCxXQUFXLEdBQUcsR0FBRyxTQUFTLENBQUMsRUFBRSxJQUFJLFNBQVMsQ0FBQyxJQUFJLElBQUksU0FBUyxDQUFDLEtBQUssQ0FBQyxlQUFlLElBQUksU0FBUyxDQUFDLEtBQUssQ0FBQyxXQUFXLEVBQUUsQ0FBQztpQkFDcEg7YUFDRDtZQUVELElBQUksRUFBRSxHQUFHLFdBQVcsQ0FBQztZQUNyQixLQUFLLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxTQUFTLENBQUMsUUFBUSxDQUFDLEdBQUcsQ0FB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