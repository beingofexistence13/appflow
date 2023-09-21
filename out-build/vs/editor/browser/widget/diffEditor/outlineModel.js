/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/arrays", "vs/base/common/cancellation", "vs/base/common/errors", "vs/base/common/iterator", "vs/base/common/strings", "vs/editor/common/core/position", "vs/editor/common/core/range"], function (require, exports, arrays_1, cancellation_1, errors_1, iterator_1, strings_1, position_1, range_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$RZ = exports.$QZ = exports.$PZ = exports.$OZ = void 0;
    // TODO@hediet: These classes are copied from outlineModel.ts because of layering issues.
    // Because these classes just depend on the DocumentSymbolProvider (which is in the core editor),
    // they should be moved to the core editor as well.
    class $OZ {
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
                const candidate = $OZ.getElementById(id, child);
                if (candidate) {
                    return candidate;
                }
            }
            return undefined;
        }
        static size(element) {
            let res = 1;
            for (const [, child] of element.children) {
                res += $OZ.size(child);
            }
            return res;
        }
        static empty(element) {
            return element.children.size === 0;
        }
    }
    exports.$OZ = $OZ;
    class $PZ extends $OZ {
        constructor(id, parent, symbol) {
            super();
            this.id = id;
            this.parent = parent;
            this.symbol = symbol;
            this.children = new Map();
        }
    }
    exports.$PZ = $PZ;
    class $QZ extends $OZ {
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
    exports.$QZ = $QZ;
    class $RZ extends $OZ {
        static create(registry, textModel, token) {
            const cts = new cancellation_1.$pd(token);
            const result = new $RZ(textModel.uri);
            const provider = registry.ordered(textModel);
            const promises = provider.map((provider, index) => {
                const id = $OZ.findId(`provider_${index}`, result);
                const group = new $QZ(id, result, provider.displayName ?? 'Unknown Outline Provider', index);
                return Promise.resolve(provider.provideDocumentSymbols(textModel, cts.token)).then(result => {
                    for (const info of result || []) {
                        $RZ.c(info, group);
                    }
                    return group;
                }, err => {
                    (0, errors_1.$Z)(err);
                    return group;
                }).then(group => {
                    if (!$OZ.empty(group)) {
                        result.d.set(id, group);
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
                    return $RZ.create(registry, textModel, token);
                }
                else {
                    return result.e();
                }
            }).finally(() => {
                cts.dispose();
                listener.dispose();
            });
        }
        static c(info, container) {
            const id = $OZ.findId(info, container);
            const res = new $PZ(id, container, info);
            if (info.children) {
                for (const childInfo of info.children) {
                    $RZ.c(childInfo, res);
                }
            }
            container.children.set(res.id, res);
        }
        static get(element) {
            while (element) {
                if (element instanceof $RZ) {
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
            this.d = new Map();
            this.children = new Map();
            this.id = 'root';
            this.parent = undefined;
        }
        e() {
            let count = 0;
            for (const [key, group] of this.d) {
                if (group.children.size === 0) { // empty
                    this.d.delete(key);
                }
                else {
                    count += 1;
                }
            }
            if (count !== 1) {
                //
                this.children = this.d;
            }
            else {
                // adopt all elements of the first group
                const group = iterator_1.Iterable.first(this.d.values());
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
            if (this.d.size !== other.d.size) {
                return false;
            }
            this.d = other.d;
            this.children = other.children;
            return true;
        }
        getItemEnclosingPosition(position, context) {
            let preferredGroup;
            if (context) {
                let candidate = context.parent;
                while (candidate && !preferredGroup) {
                    if (candidate instanceof $QZ) {
                        preferredGroup = candidate;
                    }
                    candidate = candidate.parent;
                }
            }
            let result = undefined;
            for (const [, group] of this.d) {
                result = group.getItemEnclosingPosition(position);
                if (result && (!preferredGroup || preferredGroup === group)) {
                    break;
                }
            }
            return result;
        }
        getItemById(id) {
            return $OZ.getElementById(id, this);
        }
        updateMarker(marker) {
            // sort markers by start range so that we can use
            // outline element starts for quicker look up
            marker.sort(range_1.$ks.compareRangesUsingStarts);
            for (const [, group] of this.d) {
                group.updateMarker(marker.slice(0));
            }
        }
        getTopLevelSymbols() {
            const roots = [];
            for (const child of this.children.values()) {
                if (child instanceof $PZ) {
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
            $RZ.f(bucket, roots, '');
            return bucket.sort((a, b) => position_1.$js.compare(range_1.$ks.getStartPosition(a.range), range_1.$ks.getStartPosition(b.range)) || position_1.$js.compare(range_1.$ks.getEndPosition(b.range), range_1.$ks.getEndPosition(a.range)));
        }
        static f(bucket, entries, overrideContainerLabel) {
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
                    $RZ.f(bucket, entry.children, entry.name);
                }
            }
        }
    }
    exports.$RZ = $RZ;
});
//# sourceMappingURL=outlineModel.js.map